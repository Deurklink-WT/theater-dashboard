const axios = require('axios');
const { format, parseISO } = require('date-fns');

class YesplanAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.apiKey = config.apiKey || '';
    this.organizationId = config.organizationId || '';
    
    // Yesplan gebruikt api_key als query parameter, niet als header
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
  }

  // Helper om api_key toe te voegen aan query parameters
  addApiKey(params = {}) {
    const queryParams = new URLSearchParams(params);
    if (this.apiKey) {
      queryParams.append('api_key', this.apiKey);
    }
    return queryParams.toString();
  }

  async getEvents(params = {}) {
    try {
      const { startDate, endDate, limit = 50, venueId } = params;
      
      // Yesplan gebruikt date-based queries: /api/events/date:dd-mm-yyyy
      // We moeten events per dag ophalen als er een date range is
      let allEvents = [];
      
      if (startDate && endDate && startDate === endDate) {
        // Als startDate en endDate hetzelfde zijn, gebruik directe query
        const dateStr = this.formatDateForYesplan(startDate);
        const queryString = this.addApiKey();
        const url = `/api/events/date:${dateStr}?${queryString}`;
        
        try {
          const response = await this.client.get(url);
          const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
          if (Array.isArray(events)) {
            allEvents = events;
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error(`Error fetching events for ${dateStr}:`, error.message);
          }
        }
      } else if (startDate && endDate) {
        // Haal events op voor elke dag in het bereik
        const start = new Date(startDate);
        const end = new Date(endDate);
        const currentDate = new Date(start);
        
        while (currentDate <= end) {
          const dateStr = this.formatDateForYesplan(currentDate.toISOString().split('T')[0]);
          // Yesplan geeft 404 als limit parameter wordt gebruikt met date queries
          const queryString = this.addApiKey();
          const url = `/api/events/date:${dateStr}?${queryString}`;
          
          try {
            const response = await this.client.get(url);
            // Yesplan geeft { data: [...], pagination: {...} } terug
            const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
            if (Array.isArray(events) && events.length > 0) {
              allEvents = allEvents.concat(events);
            }
          } catch (error) {
            // Negeer 404 voor dagen zonder events
            if (error.response?.status !== 404) {
              console.error(`Error fetching events for ${dateStr}:`, error.message);
            }
          }
          
          // Volgende dag
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (startDate) {
        // Alleen startDate
        const dateStr = this.formatDateForYesplan(startDate);
        // Yesplan geeft 404 als limit parameter wordt gebruikt met date queries
        const queryString = this.addApiKey();
        const url = `/api/events/date:${dateStr}?${queryString}`;
        
        const response = await this.client.get(url);
        // Yesplan geeft { data: [...], pagination: {...} } terug
        const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(events)) {
          allEvents = events;
        }
      } else {
        // Geen datum - gebruik vandaag
        const today = new Date();
        const dateStr = this.formatDateForYesplan(today.toISOString().split('T')[0]);
        // Yesplan geeft 404 als limit parameter wordt gebruikt met date queries
        const queryString = this.addApiKey();
        const url = `/api/events/date:${dateStr}?${queryString}`;
        
        const response = await this.client.get(url);
        // Yesplan geeft { data: [...], pagination: {...} } terug
        const events = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(events)) {
          allEvents = events;
        }
      }
      
      // Filter op venueId als opgegeven (gebruik locations array)
      if (venueId && allEvents.length > 0) {
        allEvents = allEvents.filter(event => {
          if (event.locations && Array.isArray(event.locations)) {
            return event.locations.some(loc => String(loc.id) === String(venueId));
          }
          return false;
        });
      }
      
      // Limiteer resultaten
      if (limit && allEvents.length > limit) {
        allEvents = allEvents.slice(0, limit);
      }
      
      return {
        success: true,
        data: await this.formatEvents(allEvents),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Yesplan API Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  extractResources(event, groupData = null, customData = null, eventCustomData = null) {
    // Resources kunnen op verschillende manieren in het event object zitten
    const resources = [];
    
    // Haal effectieve waarde uit object (Yesplan dropdowns kunnen { name: "Ja" } retourneren)
    const toEffectiveValue = (v) => {
      if (v == null) return null;
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
      if (typeof v === 'object') return v.value ?? v.name ?? v.label ?? v.text ?? null;
      return null;
    };
    // Helper functie om een waarde te checken op "Ja"/"Yes"/true/1
    const isTrueValue = (value) => {
      const v = toEffectiveValue(value);
      if (v === true || v === 1 || v === '1') return true;
      if (typeof v === 'string') {
        const lower = v.toLowerCase().trim();
        return lower === 'ja' || lower === 'yes' || lower === 'true';
      }
      return false;
    };
    // Orkestbak kan beschrijvende waarden hebben (grote bak, kleine bak) – alles behalve nee = ja
    const isOrkestbakValue = (value) => {
      const v = toEffectiveValue(value);
      if (v == null || v === '') return false;
      if (v === true || v === 1) return true;
      if (typeof v === 'string') {
        const lower = v.toLowerCase().trim();
        if (lower === 'nee' || lower === 'no') return false;
        return lower.length > 0;
      }
      return false;
    };

    // Alleen technische resources (balletvloer, vleugel, orkestbak) tellen mee voor weergave/filter
    const isTechnicalResourceName = (name) => {
      if (!name || typeof name !== 'string') return false;
      const n = name.toLowerCase().trim();
      return (n.includes('balletvloer') || n.includes('ballet')) ||
        (n.includes('vleugel') || n.includes('piano')) ||
        n.includes('orkestbak');
    };

    const pushIfTechnicalResource = (resourceName) => {
      if (!resourceName) return;
      const name = typeof resourceName === 'string' ? resourceName : (resourceName.name || resourceName.resource_name || '');
      if (!isTechnicalResourceName(name)) return;
      const canonical = (n) => {
        const lower = n.toLowerCase();
        if (lower.includes('orkestbak')) return 'Orkestbak';
        if (lower.includes('vleugel') || lower.includes('piano')) return 'Vleugel';
        if (lower.includes('balletvloer') || lower.includes('ballet')) return 'Balletvloer';
        return null;
      };
      const c = canonical(name);
      if (c && !resources.includes(c)) resources.push(c);
    };

    // Helper functie om recursief door customdata structuur te zoeken
    const searchCustomData = (obj) => {
      const found = [];
      
      if (!obj || typeof obj !== 'object') return found;
      
      // Check of dit een Resource Field is
      if (obj.keyword === 'group_group_resourcefield' || 
          (obj.type === 'Resource' && obj.value && Array.isArray(obj.value))) {
        if (Array.isArray(obj.value)) {
          obj.value.forEach(booking => {
            if (booking && booking.resource) {
              const resourceName = booking.resource.name || '';
              found.push(resourceName);
            }
          });
        }
      }
      
      // Recursief door children en groups
      if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach(child => {
          found.push(...searchCustomData(child));
        });
      }
      
      if (obj.groups && Array.isArray(obj.groups)) {
        obj.groups.forEach(group => {
          found.push(...searchCustomData(group));
        });
      }
      
      // Check alle andere properties
      for (const key in obj) {
        if (key !== 'children' && key !== 'groups' && obj[key] && typeof obj[key] === 'object') {
          found.push(...searchCustomData(obj[key]));
        }
      }
      
      return found;
    };
    
    // Check event customdata voor technische lijst velden (productie_technischelijst_balletvloer, etc.)
    // Deze velden zijn Dropdown types met waarden "Ja" of "Nee"
    if (eventCustomData) {
      const toEff = (x) => (x != null && typeof x === 'object') ? (x.value ?? x.name ?? x.label ?? x.text ?? null) : x;
      const isTrueVal = (v) => {
        const x = toEff(v);
        if (x === true || x === 1 || x === '1') return true;
        if (typeof x === 'string') {
          const l = x.toLowerCase().trim();
          return l === 'ja' || l === 'yes' || l === 'true' || l === 'jaa';
        }
        return false;
      };
      const searchEventCustomData = (obj) => {
        const found = [];
        
        if (!obj || typeof obj !== 'object') return found;
        
        // Check keyword en name (Yesplan kan beide gebruiken)
        const kw = (obj.keyword || obj.name || '').toLowerCase();
        const isTechListField = kw.includes('technischelijst') && 
          (kw.includes('balletvloer') || kw.includes('vleugel') || kw.includes('orkestbak') || kw.includes('orkest'));
        if (isTechListField) {
          const value = obj.value;
          const okForBallet = kw.includes('balletvloer') && isTrueVal(value);
          const okForVleugel = kw.includes('vleugel') && isTrueVal(value);
          const okForOrkest = (kw.includes('orkestbak') || kw.includes('orkest')) && isOrkestbakValue(value);
          if (okForBallet) found.push('Balletvloer');
          if (okForVleugel) found.push('Vleugel');
          if (okForOrkest) found.push('Orkestbak');
        }
        
        // Recursief door children en groups
        if (obj.children && Array.isArray(obj.children)) {
          obj.children.forEach(child => {
            found.push(...searchEventCustomData(child));
          });
        }
        
        if (obj.groups && Array.isArray(obj.groups)) {
          obj.groups.forEach(group => {
            found.push(...searchEventCustomData(group));
          });
        }
        
        // Check alle andere properties
        for (const key in obj) {
          if (key !== 'children' && key !== 'groups' && obj[key] && typeof obj[key] === 'object') {
            found.push(...searchEventCustomData(obj[key]));
          }
        }
        
        return found;
      };
      
      const foundResources = searchEventCustomData(eventCustomData);
      foundResources.forEach(resource => {
        if (resource && !resources.includes(resource)) {
          resources.push(resource);
        }
      });
    }
    
    // Check customdata voor Resource Fields (fallback)
    if (customData) {
      const foundResources = searchCustomData(customData);
      foundResources.forEach(resourceName => {
        if (resourceName) {
          const resourceNameLower = resourceName.toLowerCase();
          
          // Check voor balletvloer
          if ((resourceNameLower.includes('balletvloer') || resourceNameLower.includes('ballet')) && 
              !resources.includes('Balletvloer')) {
            resources.push('Balletvloer');
          }
          // Check voor vleugel/piano
          if ((resourceNameLower.includes('vleugel') || resourceNameLower.includes('piano')) && 
              !resources.includes('Vleugel')) {
            resources.push('Vleugel');
          }
          // Check voor orkestbak
          if (resourceNameLower.includes('orkestbak') && !resources.includes('Orkestbak')) {
            resources.push('Orkestbak');
          }
        }
      });
    }
    
    // Check group properties voor Resource Fields (fallback)
    if (groupData && groupData.properties && Array.isArray(groupData.properties)) {
      groupData.properties.forEach(prop => {
        // Check voor Resource Field type
        if (prop.keyword === 'group_group_resourcefield' || 
            (prop.type === 'Resource' && prop.value && Array.isArray(prop.value))) {
          // prop.value is een array van resourcebookings
          if (Array.isArray(prop.value)) {
            prop.value.forEach(booking => {
              if (booking && booking.resource) {
                const resourceName = booking.resource.name || '';
                const resourceNameLower = resourceName.toLowerCase();
                
                // Check voor balletvloer
                if ((resourceNameLower.includes('balletvloer') || resourceNameLower.includes('ballet')) && 
                    !resources.includes('Balletvloer')) {
                  resources.push('Balletvloer');
                }
                // Check voor vleugel/piano
                if ((resourceNameLower.includes('vleugel') || resourceNameLower.includes('piano')) && 
                    !resources.includes('Vleugel')) {
                  resources.push('Vleugel');
                }
                // Check voor orkestbak
                if (resourceNameLower.includes('orkestbak') && !resources.includes('Orkestbak')) {
                  resources.push('Orkestbak');
                }
              }
            });
          }
        }
      });
    }
    
    // Check ook event.group.properties als die direct beschikbaar is
    if (event.group && event.group.properties && Array.isArray(event.group.properties)) {
      event.group.properties.forEach(prop => {
        if (prop.keyword === 'group_group_resourcefield' || 
            (prop.type === 'Resource' && prop.value && Array.isArray(prop.value))) {
          if (Array.isArray(prop.value)) {
            prop.value.forEach(booking => {
              if (booking && booking.resource) {
                const resourceName = booking.resource.name || '';
                const resourceNameLower = resourceName.toLowerCase();
                
                if ((resourceNameLower.includes('balletvloer') || resourceNameLower.includes('ballet')) && 
                    !resources.includes('Balletvloer')) {
                  resources.push('Balletvloer');
                }
                if ((resourceNameLower.includes('vleugel') || resourceNameLower.includes('piano')) && 
                    !resources.includes('Vleugel')) {
                  resources.push('Vleugel');
                }
                if (resourceNameLower.includes('orkestbak') && !resources.includes('Orkestbak')) {
                  resources.push('Orkestbak');
                }
              }
            });
          }
        }
      });
    }
    
    // Helper functie om recursief door een object te zoeken
    const searchInObject = (obj, searchKey, maxDepth = 5, currentDepth = 0) => {
      if (currentDepth >= maxDepth || !obj || typeof obj !== 'object') return null;
      
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        
        const keyLower = key.toLowerCase();
        const value = obj[key];
        
        // Check of de key overeenkomt met wat we zoeken
        if (keyLower.includes(searchKey.toLowerCase())) {
          const useOrkestCheck = (searchKey.toLowerCase().includes('orkest'));
          if (useOrkestCheck ? isOrkestbakValue(value) : isTrueValue(value)) {
            return value;
          }
        }
        
        // Recursief zoeken in nested objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const found = searchInObject(value, searchKey, maxDepth, currentDepth + 1);
          if (found !== null) return found;
        }
        
        // Check arrays
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === 'object') {
              const found = searchInObject(item, searchKey, maxDepth, currentDepth + 1);
              if (found !== null) return found;
            }
          }
        }
      }
      
      return null;
    };
    
    // Check event.resources (array) – alleen technische resources (balletvloer, vleugel, orkestbak)
    if (event.resources && Array.isArray(event.resources)) {
      event.resources.forEach(resource => {
        if (resource && resource.name) {
          pushIfTechnicalResource(resource.name);
        } else if (typeof resource === 'string') {
          pushIfTechnicalResource(resource);
        }
      });
    }

    // Check event.resourcebookings (array)
    if (event.resourcebookings && Array.isArray(event.resourcebookings)) {
      event.resourcebookings.forEach(booking => {
        if (booking && booking.resource && booking.resource.name) {
          pushIfTechnicalResource(booking.resource.name);
        } else if (booking.resource_name) {
          pushIfTechnicalResource(booking.resource_name);
        }
      });
    }

    // Check event.resource_assignments (array)
    if (event.resource_assignments && Array.isArray(event.resource_assignments)) {
      event.resource_assignments.forEach(assignment => {
        if (assignment.resource && assignment.resource.name) {
          pushIfTechnicalResource(assignment.resource.name);
        } else if (assignment.resource_name) {
          pushIfTechnicalResource(assignment.resource_name);
        }
      });
    }

    // Check event.resourcebookings (object met arrays)
    if (event.resourcebookings && typeof event.resourcebookings === 'object' && !Array.isArray(event.resourcebookings)) {
      Object.values(event.resourcebookings).forEach(booking => {
        if (booking && booking.resource && booking.resource.name) {
          pushIfTechnicalResource(booking.resource.name);
        }
      });
    }

    // Check event.resources (object)
    if (event.resources && typeof event.resources === 'object' && !Array.isArray(event.resources)) {
      Object.values(event.resources).forEach(resource => {
        if (resource && resource.name) {
          pushIfTechnicalResource(resource.name);
        }
      });
    }
    
    // Check TECHNISCHE LIJST / Production data - uitgebreide check
    if (event.production) {
      // Check production.technical_list (kan object of array zijn)
      if (event.production.technical_list) {
        const techList = event.production.technical_list;
        
        // Als het een object is, check alle properties
        if (typeof techList === 'object' && !Array.isArray(techList)) {
          // Check directe properties
          for (const key in techList) {
            if (!techList.hasOwnProperty(key)) continue;
            const keyLower = key.toLowerCase();
            const value = techList[key];
            
            if (keyLower.includes('balletvloer') || keyLower.includes('ballet')) {
              if (isTrueValue(value)) {
                resources.push('Balletvloer');
              }
            }
            if (keyLower.includes('vleugel') || keyLower.includes('piano')) {
              if (isTrueValue(value)) {
                resources.push('Vleugel');
              }
            }
            if (keyLower.includes('orkestbak') || keyLower.includes('orkest')) {
              if (isOrkestbakValue(value)) {
                resources.push('Orkestbak');
              }
            }
          }
        }
        
        // Als het een array is, check elk item
        if (Array.isArray(techList)) {
          techList.forEach(item => {
            if (item && typeof item === 'object') {
              for (const key in item) {
                if (!item.hasOwnProperty(key)) continue;
                const keyLower = key.toLowerCase();
                const value = item[key];
                
                if (keyLower.includes('balletvloer') || keyLower.includes('ballet')) {
                  if (isTrueValue(value)) {
                    resources.push('Balletvloer');
                  }
                }
                if (keyLower.includes('vleugel') || keyLower.includes('piano')) {
                  if (isTrueValue(value)) {
                    resources.push('Vleugel');
                  }
                }
                if (keyLower.includes('orkestbak') || keyLower.includes('orkest')) {
                  if (isOrkestbakValue(value)) {
                    resources.push('Orkestbak');
                  }
                }
              }
            }
          });
        }
      }
      
      // Check production.properties (array)
      if (event.production.properties && Array.isArray(event.production.properties)) {
        event.production.properties.forEach(prop => {
          if (prop.name) {
            const propName = prop.name.toLowerCase();
            const propValue = prop.value;
            
            if (propName.includes('balletvloer') || propName.includes('ballet')) {
              if (isTrueValue(propValue)) {
                resources.push('Balletvloer');
              }
            }
            if (propName.includes('vleugel') || propName.includes('piano')) {
              if (isTrueValue(propValue)) {
                resources.push('Vleugel');
              }
            }
            if (propName.includes('orkestbak') || propName.includes('orkest')) {
              if (isOrkestbakValue(propValue)) {
                resources.push('Orkestbak');
              }
            }
          }
        });
      }
      
      // Recursief zoeken in production object
      if (searchInObject(event.production, 'balletvloer') !== null) {
        resources.push('Balletvloer');
      }
      if (searchInObject(event.production, 'vleugel') !== null || searchInObject(event.production, 'piano') !== null) {
        resources.push('Vleugel');
      }
      if (searchInObject(event.production, 'orkestbak') !== null || searchInObject(event.production, 'orkest') !== null) {
        resources.push('Orkestbak');
      }
    }
    
    // Check properties array voor technische lijst
    if (event.properties && Array.isArray(event.properties)) {
      event.properties.forEach(prop => {
        if (prop.name) {
          const propName = prop.name.toLowerCase();
          const propValue = prop.value;
          
          if (propName.includes('balletvloer') || propName.includes('ballet')) {
            if (isTrueValue(propValue)) {
              resources.push('Balletvloer');
            }
          }
          if (propName.includes('vleugel') || propName.includes('piano')) {
            if (isTrueValue(propValue)) {
              resources.push('Vleugel');
            }
          }
          if (propName.includes('orkestbak') || propName.includes('orkest')) {
            if (isOrkestbakValue(propValue)) {
              resources.push('Orkestbak');
            }
          }
        }
      });
    }
    
    // Check event.technical_list direct
    if (event.technical_list) {
      const techList = event.technical_list;
      if (typeof techList === 'object' && !Array.isArray(techList)) {
        for (const key in techList) {
          if (!techList.hasOwnProperty(key)) continue;
          const keyLower = key.toLowerCase();
          const value = techList[key];
          
          if (keyLower.includes('balletvloer') || keyLower.includes('ballet')) {
            if (isTrueValue(value)) {
              resources.push('Balletvloer');
            }
          }
          if (keyLower.includes('vleugel') || keyLower.includes('piano')) {
            if (isTrueValue(value)) {
              resources.push('Vleugel');
            }
          }
          if (keyLower.includes('orkestbak') || keyLower.includes('orkest')) {
            if (isOrkestbakValue(value)) {
              resources.push('Orkestbak');
            }
          }
        }
      }
    }
    
    // Recursief zoeken in het hele event object als laatste redmiddel
    if (!resources.some(r => r.toLowerCase().includes('balletvloer') || r.toLowerCase().includes('ballet'))) {
      if (searchInObject(event, 'balletvloer') !== null) {
        resources.push('Balletvloer');
      }
    }
    if (!resources.some(r => r.toLowerCase().includes('vleugel') || r.toLowerCase().includes('piano'))) {
      if (searchInObject(event, 'vleugel') !== null || searchInObject(event, 'piano') !== null) {
        resources.push('Vleugel');
      }
    }
    if (!resources.some(r => r.toLowerCase().includes('orkestbak'))) {
      if (searchInObject(event, 'orkestbak') !== null || searchInObject(event, 'orkest') !== null) {
        resources.push('Orkestbak');
      }
    }
    
    // Verwijder duplicaten en return
    return [...new Set(resources)];
  }

  extractTechnicalMaterialResources(event, eventCustomData = null) {
    const materials = new Set();

    const normalizeName = (value) => {
      if (!value) return null;
      const str = String(value).trim();
      if (!str) return null;
      if (!str.includes('/')) return str;
      const parts = str.split('/').filter(Boolean);
      if (parts.length === 2) return str;
      const after = str.replace(/^.*technisch\s+materiaal\/?/i, '').trim();
      return after || parts[parts.length - 1] || null;
    };

    const matchesTechnicalMaterial = (value) => {
      if (!value) return false;
      const str = String(value).toLowerCase();
      return str.includes('technisch materiaal') ||
        str.includes('resources/technisch materiaal') ||
        str.includes('recources/technisch materiaal');
    };

    const addMaterial = (value) => {
      const name = normalizeName(value);
      if (name) {
        materials.add(name);
      }
    };

    const getResourceName = (resource) => {
      if (!resource || typeof resource !== 'object') return null;
      return resource.name ||
        resource.resource_name ||
        resource.title ||
        resource.resource?.name ||
        resource.item?.name ||
        null;
    };

    const hasDeepMatch = (obj, depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 4) return false;
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const value = obj[key];
        if (matchesTechnicalMaterial(key) || matchesTechnicalMaterial(value)) {
          return true;
        }
        if (typeof value === 'object') {
          if (hasDeepMatch(value, depth + 1)) {
            return true;
          }
        }
      }
      return false;
    };

    const inspectResource = (resource, forceAdd = false) => {
      if (!resource) return;
      if (Array.isArray(resource)) {
        resource.forEach(item => inspectResource(item, forceAdd));
        return;
      }

      if (typeof resource === 'string') {
        if (forceAdd || matchesTechnicalMaterial(resource)) {
          addMaterial(resource);
        }
        return;
      }

      const fieldsToCheck = [
        resource.name,
        resource.path,
        resource.full_path,
        resource.folder,
        resource.category?.name,
        resource.category?.path,
        resource.category?.parent?.name,
        resource.parent?.name,
        resource.group?.name,
        resource.group?.parent?.name,
        resource.resource_name
      ];

      const hasMatch = fieldsToCheck.some(matchesTechnicalMaterial) || hasDeepMatch(resource);
      if (forceAdd || hasMatch) {
        addMaterial(
          resource.name ||
          resource.resource_name ||
          resource.path ||
          resource.full_path ||
          getResourceName(resource)
        );
      }
    };

    // event.resources (array)
    if (event.resources && Array.isArray(event.resources)) {
      event.resources.forEach(resource => inspectResource(resource));
    }

    // event.resources (object)
    if (event.resources && typeof event.resources === 'object' && !Array.isArray(event.resources)) {
      Object.values(event.resources).forEach(resource => inspectResource(resource));
    }

    // event.resourcebookings (array)
    if (event.resourcebookings && Array.isArray(event.resourcebookings)) {
      event.resourcebookings.forEach(booking => {
        inspectResource(booking.resource || booking.resource_name || booking);
      });
    }

    // event.resourcebookings (object met arrays)
    if (event.resourcebookings && typeof event.resourcebookings === 'object' && !Array.isArray(event.resourcebookings)) {
      Object.values(event.resourcebookings).forEach(booking => {
        inspectResource(booking.resource || booking.resource_name || booking);
      });
    }

    // event.resource_assignments (array)
    if (event.resource_assignments && Array.isArray(event.resource_assignments)) {
      event.resource_assignments.forEach(assignment => {
        inspectResource(assignment.resource || assignment.resource_name || assignment);
      });
    }

    // eventCustomData: zoek specifiek in "resources/Technisch materiaal" groepen
    if (eventCustomData) {
      const searchCustomData = (obj, inTechContext = false, parentName = '') => {
        if (!obj || typeof obj !== 'object') return;

        const name = String(obj.name || obj.label || obj.keyword || '').toLowerCase();
        const fullPath = parentName ? `${parentName}/${name}` : name;
        const isTechContext = inTechContext || matchesTechnicalMaterial(name) || matchesTechnicalMaterial(fullPath);

        // Als we in Technisch materiaal context zijn, probeer resources te lezen
        if (isTechContext) {
          if (obj.value) {
            if (Array.isArray(obj.value)) {
              obj.value.forEach(valueItem => {
                if (valueItem && valueItem.resource) {
                  inspectResource(valueItem.resource, true);
                } else if (valueItem && typeof valueItem === 'object') {
                  // Probeer ook resource_name, name, etc.
                  const resourceName = valueItem.resource_name || valueItem.name || valueItem.title || valueItem;
                  inspectResource(resourceName, true);
                } else {
                  inspectResource(valueItem, true);
                }
              });
            } else if (typeof obj.value === 'object') {
              // Als value een object is, probeer resource info te halen
              if (obj.value.resource) {
                inspectResource(obj.value.resource, true);
              } else if (obj.value.resource_name || obj.value.name) {
                inspectResource(obj.value, true);
              }
            } else {
              inspectResource(obj.value, true);
            }
          }

          if (obj.resource) {
            inspectResource(obj.resource, true);
          }
          
          // Probeer ook direct properties te lezen als dit een resource item lijkt
          if (obj.resource_name || (obj.name && !isTechContext)) {
            inspectResource(obj, true);
          }
        }

        if (obj.children && Array.isArray(obj.children)) {
          obj.children.forEach(child => searchCustomData(child, isTechContext, fullPath));
        }

        if (obj.groups && Array.isArray(obj.groups)) {
          obj.groups.forEach(group => searchCustomData(group, isTechContext, fullPath));
        }

        for (const key in obj) {
          if (key !== 'children' && key !== 'groups' && obj[key] && typeof obj[key] === 'object') {
            searchCustomData(obj[key], isTechContext, fullPath);
          }
        }
      };

      searchCustomData(eventCustomData, false, '');
    }

    return [...materials];
  }

  // Extract alle documenten uit TECHNISCHE LIJST (niet alleen rider, maar alle documenten)
  extractTechnicalListDocuments(eventCustomData) {
    if (!eventCustomData || !eventCustomData.groups) {
      return [];
    }

    const documents = [];

    // Helper functie om documenten te vinden
    const findDocuments = (obj, category = '') => {
      if (!obj || typeof obj !== 'object') return;

      // Check of dit een document veld is
      const isDocumentField = obj.type === 'File' || 
                             obj.type === 'Attachment' || 
                             obj.type === 'Document' ||
                             (obj.value && typeof obj.value === 'object' && obj.value.url) ||
                             (obj.value && typeof obj.value === 'string' && (obj.value.includes('/documents/') || obj.value.endsWith('.pdf')));

      if (isDocumentField) {
        let documentData = null;
        let documentName = obj.name || obj.label || 'Document';
        let documentUrl = null;
        let documentDate = null;
        let documentAuthor = null;

        // Check verschillende structuren voor document data
        if (obj.value) {
          if (typeof obj.value === 'string') {
            // String URL
            if (obj.value.includes('/documents/') || obj.value.endsWith('.pdf')) {
              documentUrl = obj.value;
              if (documentUrl.startsWith('/') && this.baseURL && !documentUrl.startsWith('http')) {
                documentUrl = this.baseURL + documentUrl;
              } else if (documentUrl.startsWith('documents/') && this.baseURL) {
                documentUrl = this.baseURL + '/' + documentUrl;
              }
            }
          } else if (typeof obj.value === 'object') {
            // Object met document info
            documentUrl = obj.value.url || obj.value.link || obj.value.href || obj.value.dataurl || obj.value.document_url;
            documentName = obj.value.name || obj.value.filename || obj.value.originalname || documentName;
            documentDate = obj.value.date || obj.value.created || obj.value.updated;
            documentAuthor = obj.value.author || obj.value.username || obj.value.created_by;
            
            if (documentUrl && documentUrl.startsWith('/') && this.baseURL && !documentUrl.startsWith('http')) {
              documentUrl = this.baseURL + documentUrl;
            } else if (documentUrl && documentUrl.startsWith('documents/') && this.baseURL) {
              documentUrl = this.baseURL + '/' + documentUrl;
            }
          }
        }

        // Check direct op url properties
        if (!documentUrl && (obj.url || obj.link || obj.href)) {
          documentUrl = obj.url || obj.link || obj.href;
          if (documentUrl.startsWith('/') && this.baseURL && !documentUrl.startsWith('http')) {
            documentUrl = this.baseURL + documentUrl;
          }
        }

        // Alleen toevoegen als we een geldige URL hebben
        if (documentUrl && (documentUrl.includes('/documents/') || documentUrl.endsWith('.pdf'))) {
          // Gebruik category als naam als die beschikbaar is (bijv. "Draaiboek", "Rider - bijlage")
          const finalName = category || documentName;
          
          documents.push({
            name: finalName,
            url: documentUrl,
            type: 'application/pdf',
            date: documentDate,
            author: documentAuthor,
            category: category
          });
        }
      }

      // Recursief door children en groups
      if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach(child => {
          // Gebruik child name als category
          const childCategory = child.name || child.label || category;
          findDocuments(child, childCategory);
        });
      }

      if (obj.groups && Array.isArray(obj.groups)) {
        obj.groups.forEach(group => {
          findDocuments(group, category);
        });
      }
    };

    // Zoek PRODUCTIE > TECHNISCHE LIJST
    const productieGroup = eventCustomData.groups.find(g => 
      g.keyword === 'productie' || 
      g.name === 'PRODUCTIE' ||
      g.name?.toLowerCase().includes('productie')
    );

    if (productieGroup && productieGroup.children) {
      const techListInProductie = productieGroup.children.find(c =>
        c.keyword === 'productie_technischelijst' ||
        c.name === 'TECHNISCHE LIJST' ||
        c.name?.toLowerCase().includes('technische lijst')
      );
      
      if (techListInProductie && techListInProductie.children) {
        // Zoek alle documenten in TECHNISCHE LIJST
        techListInProductie.children.forEach(child => {
          const category = child.name || child.label || '';
          findDocuments(child, category);
        });
      }
    }

    // Fallback: zoek direct in TECHNISCHE LIJST groep
    const techListGroup = eventCustomData.groups.find(g => 
      g.keyword === 'productie_technischelijst' || 
      g.name === 'TECHNISCHE LIJST' ||
      g.name?.toLowerCase().includes('technische lijst')
    );

    if (techListGroup) {
      findDocuments(techListGroup, 'TECHNISCHE LIJST');
    }

    return documents;
  }

  // Extract bijlage/rider informatie uit eventCustomData (oude functie, behouden voor backwards compatibility)
  extractRiderAttachment(eventCustomData) {
    if (!eventCustomData || !eventCustomData.groups) {
      return null;
    }

    // Helper functie om recursief door customdata te zoeken naar bijlage/rider
    const searchForAttachment = (obj, path = []) => {
      if (!obj || typeof obj !== 'object') return null;

      // Check eerst direct op document URLs in value (ook als het geen File type is)
      if (obj.value) {
        if (typeof obj.value === 'string') {
          // Check of het een document URL is - MOET /documents/ bevatten of eindigen op .pdf
          // NIET andere API endpoints zoals /api/contactbooking/
          const isDocumentUrl = obj.value.includes('/documents/') || 
                                (obj.value.endsWith('.pdf') && !obj.value.includes('/api/'));
          
          if (isDocumentUrl) {
            let url = obj.value;
            // Als het een relatief pad is, maak er een absolute URL van
            if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) {
              url = this.baseURL + url;
            } else if (url.startsWith('documents/') && this.baseURL) {
              url = this.baseURL + '/' + url;
            }
            
            // Check of dit een rider/bijlage veld is OF als het een document URL is
            const isRiderField = obj.name?.toLowerCase().includes('rider') || 
                                 obj.name?.toLowerCase().includes('bijlage') ||
                                 obj.keyword?.toLowerCase().includes('rider') ||
                                 obj.keyword?.toLowerCase().includes('bijlage') ||
                                 obj.label?.toLowerCase().includes('rider') ||
                                 obj.label?.toLowerCase().includes('bijlage');
            
            // Alleen accepteren als het een document URL is (met /documents/) of een rider/bijlage veld
            if (isRiderField || url.includes('/documents/')) {
              return {
                name: obj.name || obj.label || obj.value.split('/').pop() || 'Bijlage',
                url: url,
                type: 'application/pdf'
              };
            }
          }
        }
        // Check ook als value een object is met een URL property
        else if (typeof obj.value === 'object') {
          const url = obj.value.url || obj.value.link || obj.value.href || obj.value.document_url || obj.value.documentUrl;
          // Alleen document URLs accepteren - MOET /documents/ bevatten
          if (url && url.includes('/documents/')) {
            let fullUrl = url;
            if (fullUrl.startsWith('/') && this.baseURL && !fullUrl.startsWith('http')) {
              fullUrl = this.baseURL + fullUrl;
            } else if (fullUrl.startsWith('documents/') && this.baseURL) {
              fullUrl = this.baseURL + '/' + fullUrl;
            }
            
            // Alleen accepteren als het een document URL is
            if (fullUrl.includes('/documents/')) {
              return {
                name: obj.value.name || obj.value.filename || obj.name || obj.label || fullUrl.split('/').pop() || 'Bijlage',
                url: fullUrl,
                type: 'application/pdf'
              };
            }
          }
        }
      }
      
      // Check ook direct op url/link/href properties
      if (obj.url || obj.link || obj.href) {
        const url = obj.url || obj.link || obj.href;
        // Alleen document URLs accepteren - MOET /documents/ bevatten
        if (url && url.includes('/documents/')) {
          let fullUrl = url;
          if (fullUrl.startsWith('/') && this.baseURL && !fullUrl.startsWith('http')) {
            fullUrl = this.baseURL + fullUrl;
          } else if (fullUrl.startsWith('documents/') && this.baseURL) {
            fullUrl = this.baseURL + '/' + fullUrl;
          }
          
          // Alleen accepteren als het een document URL is
          if (fullUrl.includes('/documents/')) {
            return {
              name: obj.name || obj.label || fullUrl.split('/').pop() || 'Bijlage',
              url: fullUrl,
              type: 'application/pdf'
            };
          }
        }
      }

      // Check voor file/attachment velden - verschillende mogelijke structuren
      const isFileField = obj.type === 'File' || 
                         obj.type === 'Attachment' || 
                         obj.type === 'Document' ||
                         obj.keyword?.toLowerCase().includes('rider') || 
                         obj.keyword?.toLowerCase().includes('bijlage') ||
                         obj.keyword?.toLowerCase().includes('attachment') ||
                         obj.name?.toLowerCase().includes('rider') ||
                         obj.name?.toLowerCase().includes('bijlage') ||
                         (obj.name && obj.name.toLowerCase().includes('rider - bijlage'));

      if (isFileField) {
        // Check verschillende mogelijke structuren voor file data
        let fileData = null;
        
        // Structuur 1: obj.value is een object met file info
        if (obj.value && typeof obj.value === 'object') {
          // Check voor document URL in value object - MOET /documents/ bevatten
          const url = obj.value.url || obj.value.link || obj.value.href || obj.value.document_url || obj.value.documentUrl;
          const name = obj.value.name || obj.value.filename || obj.name || obj.value.title || obj.label || 'Bijlage';
          
          // Alleen accepteren als het een document URL is
          if (url && url.includes('/documents/')) {
            let fullUrl = url;
            if (fullUrl.startsWith('/') && this.baseURL && !fullUrl.startsWith('http')) {
              fullUrl = this.baseURL + fullUrl;
            } else if (fullUrl.startsWith('documents/') && this.baseURL) {
              fullUrl = this.baseURL + '/' + fullUrl;
            }
            
            // Alleen accepteren als het een document URL is
            if (fullUrl.includes('/documents/')) {
              fileData = {
                name: name,
                url: fullUrl,
                type: obj.value.type || obj.value.mime_type || obj.value.content_type || 'application/pdf',
                date: obj.value.date || obj.value.created || obj.value.updated,
                author: obj.value.author || obj.value.created_by || obj.value.uploaded_by
              };
            }
          }
        }
        // Structuur 2: obj.value is een string (URL of document path)
        else if (obj.value && typeof obj.value === 'string') {
          // Check of het een document path is - MOET /documents/ bevatten
          if (obj.value.includes('/documents/') || (obj.value.startsWith('/documents/') || obj.value.startsWith('documents/'))) {
            // Als het een relatief pad is, maak er een absolute URL van
            let url = obj.value;
            if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) {
              url = this.baseURL + url;
            } else if (url.startsWith('documents/') && this.baseURL) {
              url = this.baseURL + '/' + url;
            }
            
            // Alleen accepteren als het een document URL is
            if (url.includes('/documents/')) {
              fileData = {
                name: obj.name || obj.label || 'Bijlage',
                url: url,
                type: 'application/pdf'
              };
            }
          }
        }
        // Structuur 3: obj heeft direct url/file/document properties
        else if (obj.url || obj.file || obj.href || obj.document_url || obj.documentUrl) {
          let url = obj.url || obj.file || obj.href || obj.document_url || obj.documentUrl;
          // Alleen accepteren als het een document URL is - MOET /documents/ bevatten
          if (url && url.includes('/documents/')) {
            // Als het een relatief pad is, maak er een absolute URL van
            if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) {
              url = this.baseURL + url;
            } else if (url.startsWith('documents/') && this.baseURL) {
              url = this.baseURL + '/' + url;
            }
            
            // Alleen accepteren als het een document URL is
            if (url.includes('/documents/')) {
              fileData = {
                name: obj.name || obj.label || 'Bijlage',
                url: url,
                type: obj.type || 'application/pdf'
              };
            }
          }
        }
        // Structuur 4: Check voor document_id of documentId en bouw URL
        else if (obj.document_id || obj.documentId) {
          const docId = obj.document_id || obj.documentId;
          if (this.baseURL) {
            // Probeer verschillende URL formaten
            const possibleUrls = [
              `${this.baseURL}/documents/${docId}`,
              `${this.baseURL}/api/documents/${docId}`,
              `${this.baseURL}/document/${docId}`
            ];
            
            fileData = {
              name: obj.name || obj.label || 'Bijlage',
              url: possibleUrls[0], // Gebruik eerste format als default
              type: 'application/pdf'
            };
          }
        }

        if (fileData && fileData.url) {
          return fileData;
        }
      }

      // Recursief door children en groups zoeken
      if (obj.children && Array.isArray(obj.children)) {
        for (const child of obj.children) {
          const found = searchForAttachment(child, [...path, 'children']);
          if (found) return found;
        }
      }

      if (obj.groups && Array.isArray(obj.groups)) {
        for (const group of obj.groups) {
          const found = searchForAttachment(group, [...path, 'groups']);
          if (found) return found;
        }
      }

      // Check alle andere properties die objecten kunnen zijn
      for (const key in obj) {
        if (key !== 'children' && key !== 'groups' && key !== 'value' && key !== 'url' && key !== 'link' && key !== 'href' && obj[key] && typeof obj[key] === 'object') {
          const found = searchForAttachment(obj[key], [...path, key]);
          if (found) return found;
        }
        // Check ook string properties die URLs kunnen zijn
        else if (key !== 'children' && key !== 'groups' && key !== 'value' && typeof obj[key] === 'string') {
          const strValue = obj[key];
          // Check of het een document URL is - MOET /documents/ bevatten
          if (strValue.includes('/documents/')) {
            let url = strValue;
            if (url.startsWith('/') && this.baseURL && !url.startsWith('http')) {
              url = this.baseURL + url;
            } else if (url.startsWith('documents/') && this.baseURL) {
              url = this.baseURL + '/' + url;
            }
            
            // Alleen accepteren als het een document URL is
            if (url.includes('/documents/')) {
              return {
                name: obj.name || obj.label || url.split('/').pop().split('?')[0] || 'Bijlage',
                url: url,
                type: 'application/pdf'
              };
            }
          }
        }
      }

      return null;
    };

    // Zoek eerst specifiek in PRODUCTIE > TECHNISCHE LIJST > Rider - bijlage
    const productieGroup = eventCustomData.groups.find(g => 
      g.keyword === 'productie' || 
      g.name === 'PRODUCTIE' ||
      g.name?.toLowerCase().includes('productie')
    );

    if (productieGroup && productieGroup.children) {
      // Zoek TECHNISCHE LIJST in children van PRODUCTIE
      const techListInProductie = productieGroup.children.find(c =>
        c.keyword === 'productie_technischelijst' ||
        c.name === 'TECHNISCHE LIJST' ||
        c.name?.toLowerCase().includes('technische lijst')
      );
      
      if (techListInProductie && techListInProductie.children) {
        // Zoek "Rider - bijlage" in children van TECHNISCHE LIJST
        const riderBijlage = techListInProductie.children.find(c =>
          (c.keyword === 'rider' || c.name?.toLowerCase().includes('rider')) &&
          c.type === 'Attachment' &&
          c.value &&
          typeof c.value === 'object' &&
          c.value.dataurl
        );
        
        if (riderBijlage && riderBijlage.value && riderBijlage.value.dataurl) {
          // Check of het een document URL is
          const url = riderBijlage.value.dataurl;
          if (url.includes('/documents/')) {
            return {
              name: riderBijlage.value.originalname || riderBijlage.name || 'Technische lijst',
              url: url,
              type: riderBijlage.value.datatype || 'application/pdf',
              date: riderBijlage.value.date || null,
              author: riderBijlage.value.username || null
            };
          }
        }
      }
    }

    // Fallback: Zoek eerst in TECHNISCHE LIJST groep (direct)
    const techListGroup = eventCustomData.groups.find(g => 
      g.keyword === 'productie_technischelijst' || 
      g.name === 'TECHNISCHE LIJST' ||
      g.name?.toLowerCase().includes('technische lijst')
    );

    if (techListGroup) {
      const attachment = searchForAttachment(techListGroup);
      if (attachment) return attachment;
    }

    // Fallback: Zoek in PRODUCTIE groep (algemeen)
    if (productieGroup) {
      // Zoek direct in PRODUCTIE groep
      const attachment = searchForAttachment(productieGroup);
      if (attachment) return attachment;
    }

    // Zoek in alle groups als fallback
    for (const group of eventCustomData.groups) {
      const attachment = searchForAttachment(group);
      if (attachment) return attachment;
    }

    return null;
  }

  // Extract technische opmerkingen uit eventCustomData
  extractTechnicalRemarks(eventCustomData) {
    if (!eventCustomData || !eventCustomData.groups) {
      return null;
    }

    // Zoek eerst specifiek in PRODUCTIE > TECHNISCHE LIJST > Opmerkingen techniek
    const productieGroup = eventCustomData.groups.find(g => 
      g.keyword === 'productie' || 
      g.name === 'PRODUCTIE' ||
      g.name?.toLowerCase().includes('productie')
    );

    if (productieGroup && productieGroup.children) {
      // Zoek TECHNISCHE LIJST in children van PRODUCTIE
      const techListInProductie = productieGroup.children.find(c =>
        c.keyword === 'productie_technischelijst' ||
        c.name === 'TECHNISCHE LIJST' ||
        c.name?.toLowerCase().includes('technische lijst')
      );
      
      if (techListInProductie && techListInProductie.children) {
        // Zoek "Opmerkingen techniek" in children van TECHNISCHE LIJST
        const opmerkingenTechniek = techListInProductie.children.find(c =>
          c.keyword === 'productie_technischelijst_opmerkingentechniek' ||
          c.name === 'Opmerkingen techniek' ||
          c.name?.toLowerCase().includes('opmerkingen techniek')
        );
        
        if (opmerkingenTechniek) {
          // Haal de waarde op (kan string zijn of object met value property)
          let value = null;
          if (typeof opmerkingenTechniek.value === 'string') {
            value = opmerkingenTechniek.value.trim();
          } else if (opmerkingenTechniek.value && typeof opmerkingenTechniek.value === 'object') {
            value = opmerkingenTechniek.value.value || opmerkingenTechniek.value.text || null;
            if (value && typeof value === 'string') {
              value = value.trim();
            }
          }
          
          if (value && value.length > 0) {
            return value;
          }
        }
      }
    }

    // Fallback: Zoek direct in TECHNISCHE LIJST groep
    const techListGroup = eventCustomData.groups.find(g => 
      g.keyword === 'productie_technischelijst' || 
      g.name === 'TECHNISCHE LIJST' ||
      g.name?.toLowerCase().includes('technische lijst')
    );

    if (techListGroup && techListGroup.children) {
      const opmerkingenTechniek = techListGroup.children.find(c =>
        c.keyword === 'productie_technischelijst_opmerkingentechniek' ||
        c.name === 'Opmerkingen techniek' ||
        c.name?.toLowerCase().includes('opmerkingen techniek')
      );
      
      if (opmerkingenTechniek) {
        let value = null;
        if (typeof opmerkingenTechniek.value === 'string') {
          value = opmerkingenTechniek.value.trim();
        } else if (opmerkingenTechniek.value && typeof opmerkingenTechniek.value === 'object') {
          value = opmerkingenTechniek.value.value || opmerkingenTechniek.value.text || null;
          if (value && typeof value === 'string') {
            value = value.trim();
          }
        }
        
        if (value && value.length > 0) {
          return value;
        }
      }
    }

    return null;
  }

  // Extract ureninfo (Uurwerk personeelsplanning) uit eventCustomData
  extractUrenInfo(eventCustomData) {
    if (!eventCustomData || !eventCustomData.groups) {
      return {
        techniek: [],
        horeca: [],
        frontOffice: []
      };
    }

    // Zoek eerst naar EVENT - INFO groep
    const eventInfoGroup = eventCustomData.groups.find(g => 
      g.keyword === 'eventinfo' || g.name === 'EVENT - INFO'
    );

    if (!eventInfoGroup || !eventInfoGroup.children) {
      return {
        techniek: [],
        horeca: [],
        frontOffice: []
      };
    }

    // Zoek dan naar URENINFO child binnen EVENT - INFO
    const urenInfoGroup = eventInfoGroup.children.find(c => 
      c.keyword === 'eventinfo_ureninfo' || c.name === 'URENINFO'
    );

    if (!urenInfoGroup || !urenInfoGroup.children) {
      return {
        techniek: [],
        horeca: [],
        frontOffice: []
      };
    }

    // Helper om tekst te parsen naar array van entries
    const parseUrenText = (text) => {
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return [];
      }
      // Split op newlines en filter lege regels
      return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    };

    // Zoek de specifieke velden
    let techniek = [];
    let horeca = [];
    let frontOffice = [];

    urenInfoGroup.children.forEach(child => {
      if (child.keyword === 'urenuurwerktechniek' && child.value) {
        techniek = parseUrenText(child.value);
      } else if (child.keyword === 'urenuurwerkhoreca' && child.value) {
        horeca = parseUrenText(child.value);
      } else if (child.keyword === 'urenuurwerkfrontoffice' && child.value) {
        frontOffice = parseUrenText(child.value);
      }
    });

    return {
      techniek,
      horeca,
      frontOffice
    };
  }

  formatDateForYesplan(dateString) {
    // Converteer YYYY-MM-DD naar dd-mm-yyyy
    if (!dateString) return '';
    
    // Parse direct uit string om timezone problemen te voorkomen
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // YYYY-MM-DD formaat
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${day}-${month}-${year}`;
      }
    }
    
    // Fallback naar Date object parsing
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async getSchedule(eventId) {
    try {
      const queryString = this.addApiKey();
      const url = queryString ? `/api/event/${eventId}/schedule?${queryString}` : `/api/event/${eventId}/schedule`;

      const response = await this.client.get(url);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, data: { items: [] }, timestamp: new Date().toISOString() };
      }
      console.error('Yesplan Schedule Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async getEventDetails(eventId) {
    try {
      const queryString = this.addApiKey();
      const url = queryString ? `/api/event/${eventId}?${queryString}` : `/api/event/${eventId}`;
      
      const response = await this.client.get(url);
      
      return {
        success: true,
        data: this.formatEventDetails(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Yesplan Event Details Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async getReservations(params = {}) {
    try {
      const { eventId, startDate, endDate, venueId } = params;
      const queryParams = {};
      
      if (eventId) queryParams.event_id = eventId;
      if (startDate) queryParams.start_date = this.formatDateForYesplan(startDate);
      if (endDate) queryParams.end_date = this.formatDateForYesplan(endDate);
      if (venueId) queryParams.venue_id = venueId;
      
      const queryString = this.addApiKey(queryParams);
      
      // Probeer verschillende endpoints
      let reservations = [];
      
      // Probeer /api/reservations
      try {
        const url = `/api/reservations?${queryString}`;
        const response = await this.client.get(url);
        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(data)) {
          reservations = data;
        }
      } catch (error) {
        // Als /api/reservations niet werkt, probeer /api/bookings
        if (error.response?.status === 404) {
          try {
            const url = `/api/bookings?${queryString}`;
            const response = await this.client.get(url);
            const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
            if (Array.isArray(data)) {
              reservations = data;
            }
          } catch (error2) {
            // Als beide niet werken, haal reserveringen uit event details
            // Reservations endpoint not found, extracting from events
          }
        }
      }
      
      // Als er geen directe reserveringen endpoint is, haal reserveringen uit events
      if (reservations.length === 0 && (startDate || eventId)) {
        // Haal events op en extract reserveringen (inclusief Itix data)
        const eventsResult = await this.getEvents({ startDate, endDate, venueId });
        if (eventsResult.success && eventsResult.data) {
          eventsResult.data.forEach(event => {
            if (event.rawEvent) {
              // Check voor reserveringen in event data
              const rawEvent = event.rawEvent;
              
              // Check voor Itix reserveringen data (van Itix naar Yesplan)
              // Itix stuurt reserveringen data naar Yesplan, mogelijk in verschillende velden
              if (rawEvent.ticketing && rawEvent.ticketing.reserved) {
                // Directe reserveringen count uit Itix
                const reservedCount = rawEvent.ticketing.reserved || 0;
                if (reservedCount > 0) {
                  reservations.push({
                    id: `itix-reserved-${event.id}`,
                    eventId: event.id,
                    eventName: event.title,
                    customerName: 'Itix Reserveringen',
                    customerEmail: '',
                    tickets: reservedCount,
                    status: 'reserved',
                    reservationDate: rawEvent.ticketing.status_date || rawEvent.starttime,
                    notes: 'Reserveringen van Itix',
                    source: 'itix'
                  });
                }
              }
              
              // Check voor Itix data in andere velden
              if (rawEvent.itix_data && rawEvent.itix_data.Gereserveerd) {
                const reservedCount = parseInt(rawEvent.itix_data.Gereserveerd) || 0;
                if (reservedCount > 0) {
                  reservations.push({
                    id: `itix-reserved-${event.id}`,
                    eventId: event.id,
                    eventName: event.title,
                    customerName: 'Itix Reserveringen',
                    customerEmail: '',
                    tickets: reservedCount,
                    status: 'reserved',
                    reservationDate: rawEvent.itix_data['Status op'] || rawEvent.starttime,
                    notes: 'Reserveringen van Itix',
                    source: 'itix'
                  });
                }
              }
              
              // Check voor reserveringen in event properties (mogelijk Itix integratie)
              if (rawEvent.properties) {
                const reservedProp = rawEvent.properties.find(p => 
                  p.name && (p.name.toLowerCase().includes('gereserveerd') || 
                            p.name.toLowerCase().includes('reserved') ||
                            p.name.toLowerCase().includes('itix'))
                );
                if (reservedProp && reservedProp.value) {
                  const reservedCount = parseInt(reservedProp.value) || 0;
                  if (reservedCount > 0) {
                    reservations.push({
                      id: `itix-reserved-${event.id}`,
                      eventId: event.id,
                      eventName: event.title,
                      customerName: 'Itix Reserveringen',
                      customerEmail: '',
                      tickets: reservedCount,
                      status: 'reserved',
                      reservationDate: rawEvent.starttime,
                      notes: `Reserveringen van Itix (${reservedProp.name})`,
                      source: 'itix'
                    });
                  }
                }
              }
              
              // Mogelijke velden: reservations, bookings, ticket_reservations, etc.
              if (rawEvent.reservations && Array.isArray(rawEvent.reservations)) {
                rawEvent.reservations.forEach(res => {
                  reservations.push({
                    id: res.id || res._id,
                    eventId: event.id,
                    eventName: event.title,
                    customerName: res.customer_name || res.name || res.customer?.name,
                    customerEmail: res.customer_email || res.email || res.customer?.email,
                    tickets: res.tickets || res.ticket_count || res.quantity || 1,
                    status: res.status || 'reserved',
                    reservationDate: res.reservation_date || res.date || res.created_at,
                    notes: res.notes || res.comment
                  });
                });
              }
              
              if (rawEvent.bookings && Array.isArray(rawEvent.bookings)) {
                rawEvent.bookings.forEach(book => {
                  if (book.status === 'reserved' || book.type === 'reservation') {
                    reservations.push({
                      id: book.id || book._id,
                      eventId: event.id,
                      eventName: event.title,
                      customerName: book.customer_name || book.name || book.customer?.name,
                      customerEmail: book.customer_email || book.email || book.customer?.email,
                      tickets: book.tickets || book.ticket_count || book.quantity || 1,
                      status: book.status || 'reserved',
                      reservationDate: book.reservation_date || book.date || book.created_at,
                      notes: book.notes || book.comment
                    });
                  }
                });
              }
            }
          });
        }
      }
      
      return {
        success: true,
        data: this.formatReservations(reservations),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Yesplan Reservations Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  formatReservations(reservations) {
    if (!Array.isArray(reservations)) return [];
    
    return reservations.map(reservation => ({
      id: reservation.id,
      eventId: reservation.eventId,
      eventName: reservation.eventName || 'Onbekend evenement',
      customerName: reservation.customerName || 'Onbekend',
      customerEmail: reservation.customerEmail || '',
      tickets: reservation.tickets || 1,
      status: reservation.status || 'reserved',
      reservationDate: reservation.reservationDate,
      notes: reservation.notes || '',
      formattedDate: reservation.reservationDate ? format(parseISO(reservation.reservationDate), 'dd-MM-yyyy HH:mm') : ''
    }));
  }

  async getVenues() {
    try {
      // Yesplan heeft geen directe venues endpoint, dus halen we venues uit events
      // Haal events op over een periode om alle venues te vinden
      const today = new Date();
      const venueMap = new Map();
      let foundEvents = 0;
      
      // Check vandaag en de komende 30 dagen (genoeg om alle venues te vinden)
      const daysToCheck = [];
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        daysToCheck.push(checkDate);
      }
      
      // Haal events parallel op (max 10 tegelijk voor snellere verwerking)
      const batchSize = 10;
      for (let i = 0; i < daysToCheck.length; i += batchSize) {
        const batch = daysToCheck.slice(i, i + batchSize);
        const promises = batch.map(date => {
          const dateStr = this.formatDateForYesplan(date.toISOString().split('T')[0]);
          // Yesplan geeft 404 als limit parameter wordt gebruikt met date queries
          const queryString = this.addApiKey();
          const url = `/api/events/date:${dateStr}?${queryString}`;
          
          return this.client.get(url)
            .then(response => response)
            .catch(error => {
              // Bij 404 is er geen data, maar check of er toch data is
              if (error.response?.status === 404) {
                return null; // Geen events op deze dag
              }
              // Bij andere errors, log maar return null
              console.error(`Error fetching events for ${dateStr}:`, error.message);
              return null;
            });
        });
        
        const responses = await Promise.all(promises);
        
        responses.forEach((response) => {
          if (response && response.data) {
            // Yesplan geeft { data: [...], pagination: {...} } terug
            const events = response.data.data || (Array.isArray(response.data) ? response.data : []);
            
            if (Array.isArray(events) && events.length > 0) {
              foundEvents += events.length;
              
              // Extraheer unieke locations (venues) uit events
              events.forEach(event => {
                // Yesplan gebruikt locations array
                if (event.locations && Array.isArray(event.locations) && event.locations.length > 0) {
                  event.locations.forEach(location => {
                    const locationId = location.id;
                    if (locationId && !venueMap.has(locationId)) {
                      venueMap.set(locationId, {
                        id: location.id,
                        name: location.name || 'Onbekende zaal',
                        capacity: location.capacity || 0,
                        location: location.location || '',
                        description: location.description || '',
                        type: location._type || 'location',
                        url: location.url
                      });
                    }
                  });
                }
              });
            }
          }
        });
        
        // Stop als we genoeg venues hebben gevonden (minimaal 5)
        if (venueMap.size >= 5 && foundEvents >= 20) {
          break;
        }
      }
      
      const venues = Array.from(venueMap.values());
      
      // Sorteer alfabetisch op naam (geen specifieke volgorde)
      venues.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      return {
        success: true,
        data: this.formatVenues(venues),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Yesplan Venues Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  formatVenues(venues) {
    if (!Array.isArray(venues)) return [];
    
    return venues.map(venue => ({
      id: venue.id || venue.venue_id,
      name: venue.name || venue.venue_name || 'Onbekende zaal',
      capacity: venue.capacity || 0,
      location: venue.location || '',
      description: venue.description || '',
      type: venue.type || 'venue'
    }));
  }

  async formatEvents(events) {
    if (!Array.isArray(events)) return [];
    
    try {
      // Haal group data en customdata op voor events die dat nodig hebben (parallel voor performance)
      const groupDataPromises = events.map(async (event) => {
      if (event.group && event.group.id) {
        try {
          const queryString = this.addApiKey();
          
          // Haal group data op
          let groupData = null;
          try {
            const groupUrl = `${event.group.url}?${queryString}`;
            const groupResponse = await this.client.get(groupUrl);
            groupData = groupResponse.data;
          } catch (error) {
            // Negeer errors
          }
          
          // Haal ook customdata op (bevat Resource Fields en technische lijst velden)
          let customData = null;
          let eventCustomData = null;
          try {
            // Group customdata (definitie)
            const customDataUrl = `/api/group/${event.group.id}/customdata?${queryString}`;
            const customDataResponse = await this.client.get(customDataUrl);
            customData = customDataResponse.data;
          } catch (error) {
            // Negeer errors
          }
          
          // Haal ook event customdata op (bevat de werkelijke waarden)
          try {
            const eventCustomDataUrl = `/api/event/${event.id}/customdata?${queryString}`;
            const eventCustomDataResponse = await this.client.get(eventCustomDataUrl);
            eventCustomData = eventCustomDataResponse.data;
          } catch (error) {
            // Negeer errors
          }
          
          // Haal event details op (incl. ticketing/resources)
          let ticketingData = null;
          let eventDetails = null;
          let resourceBookingsData = null;
          try {
            // Probeer eerst via event details met expand
            const eventDetailUrl = `/api/event/${event.id}?${queryString}&expand=ticketing,resources,resourcebookings,contactbookings`;
            const eventDetailResponse = await this.client.get(eventDetailUrl);
            eventDetails = eventDetailResponse.data || null;
            if (eventDetails && eventDetails.ticketing) {
              ticketingData = eventDetails.ticketing;
            }
            if (eventDetails && eventDetails.resourcebookings) {
              resourceBookingsData = eventDetails.resourcebookings;
            }
          } catch (error) {
            // Probeer alternatief: ticketing endpoint
            try {
              const ticketingUrl = `/api/event/${event.id}/ticketing?${queryString}`;
              const ticketingResponse = await this.client.get(ticketingUrl);
              ticketingData = ticketingResponse.data;
            } catch (e2) {
              // Negeer errors - ticketing data niet beschikbaar
            }
          }
          
          // Haal expliciet resourcebookings op als dat niet in eventDetails zat
          if (!resourceBookingsData) {
            try {
              const resourceBookingsUrl = `/api/event/${event.id}/resourcebookings?${queryString}`;
              const resourceBookingsResponse = await this.client.get(resourceBookingsUrl);
              resourceBookingsData = resourceBookingsResponse.data?.data || resourceBookingsResponse.data;
            } catch (error) {
              // Negeer errors
            }
          }
          
          return { 
            eventId: event.id, 
            groupData: groupData,
            customData: customData,
            eventCustomData: eventCustomData,
            ticketingData: ticketingData,
            eventDetails: eventDetails,
            resourceBookingsData: resourceBookingsData
          };
        } catch (error) {
          // Negeer errors, return null
          return { eventId: event.id, groupData: null, customData: null, eventCustomData: null };
        }
      }
      return { eventId: event.id, groupData: null, customData: null, eventCustomData: null };
    });
    
    const groupDataResults = await Promise.all(groupDataPromises);
    const groupDataMap = new Map();
    const customDataMap = new Map();
    const eventCustomDataMap = new Map();
    const ticketingDataMap = new Map();
    const eventDetailsMap = new Map();
    const resourceBookingsMap = new Map();
    groupDataResults.forEach(result => {
      if (result.groupData) {
        groupDataMap.set(result.eventId, result.groupData);
      }
      if (result.customData) {
        customDataMap.set(result.eventId, result.customData);
      }
      if (result.eventCustomData) {
        eventCustomDataMap.set(result.eventId, result.eventCustomData);
      }
      if (result.ticketingData) {
        ticketingDataMap.set(result.eventId, result.ticketingData);
      }
      if (result.eventDetails) {
        eventDetailsMap.set(result.eventId, result.eventDetails);
      }
      if (result.resourceBookingsData) {
        resourceBookingsMap.set(result.eventId, result.resourceBookingsData);
      }
    });
    
    return events.map(event => {
      const groupData = groupDataMap.get(event.id) || null;
      const customData = customDataMap.get(event.id) || null;
      const eventCustomData = eventCustomDataMap.get(event.id) || null;
      const ticketingData = ticketingDataMap.get(event.id) || null;
      const eventDetails = eventDetailsMap.get(event.id) || null;
      const resourceBookingsData = resourceBookingsMap.get(event.id) || null;
      // Yesplan gebruikt starttime/endtime en locations array
      const locations = event.locations && Array.isArray(event.locations) 
        ? event.locations.map(loc => loc.name).join(', ')
        : 'Onbekend';
      const venueIds = event.locations && Array.isArray(event.locations)
        ? event.locations.map(loc => String(loc.id))
        : [];
      
      // Gebruik defaultschedulestart/end als beschikbaar, anders starttime/endtime
      const startTime = event.defaultschedulestart || event.starttime || event.start_date;
      const endTime = event.defaultscheduleend || event.endtime || event.end_date;
      
      // Haal uitvoerende op uit group of parentgroup
      const performer = event.group?.name || event.parentgroup?.name || null;
      
      // Haal schedule tijden op (voor opbouw, pauze, etc.)
      const scheduleStartTime = event.defaultschedulestarttime;
      const scheduleEndTime = event.defaultscheduleendtime;
      const scheduleDescription = event.defaultscheduledescription;
      
      // Haal resources op (balletvloer, vleugel, etc.) - gebruik group data, customdata en event customdata
      const eventForResources = eventDetails 
        ? { ...event, ...eventDetails, resourcebookings: resourceBookingsData || eventDetails.resourcebookings || event.resourcebookings }
        : { ...event, resourcebookings: resourceBookingsData || event.resourcebookings };
      const resources = this.extractResources(eventForResources, groupData, customData, eventCustomData);
      const technicalMaterialResources = this.extractTechnicalMaterialResources(eventForResources, eventCustomData);

      // Debug: log resource structuur als technisch materiaal ontbreekt
      if (technicalMaterialResources.length === 0) {
        const rawResources = eventForResources.resources;
        const rawResourceBookings = eventForResources.resourcebookings;
        const resourcesCount = Array.isArray(rawResources)
          ? rawResources.length
          : (rawResources && typeof rawResources === 'object' ? Object.keys(rawResources).length : 0);
        const resourceBookingsCount = Array.isArray(rawResourceBookings)
          ? rawResourceBookings.length
          : (rawResourceBookings && typeof rawResourceBookings === 'object' ? Object.keys(rawResourceBookings).length : 0);
      }
      
      // Haal ureninfo op uit eventCustomData (bevat Uurwerk personeelsplanning)
      const urenInfo = this.extractUrenInfo(eventCustomData);
      
      // Haal technische opmerkingen op uit eventCustomData
      let technicalRemarks = null;
      try {
        technicalRemarks = this.extractTechnicalRemarks(eventCustomData);
      } catch (error) {
        // Negeer errors bij het ophalen van technische opmerkingen
        console.error('Error extracting technical remarks:', error);
      }
      
      // Haal alle documenten uit TECHNISCHE LIJST op (niet alleen rider, maar alle documenten)
      let technicalListDocuments = [];
      try {
        technicalListDocuments = this.extractTechnicalListDocuments(eventCustomData);
      } catch (error) {
        // Negeer errors bij het ophalen van technische lijst documenten
        console.error('Error extracting technical list documents:', error);
      }
      
      // Backwards compatibility: haal ook rider attachment op (voor oude code)
      let riderAttachment = null;
      if (technicalListDocuments.length > 0) {
        // Gebruik eerste document als rider attachment voor backwards compatibility
        riderAttachment = technicalListDocuments[0];
      } else {
      try {
        riderAttachment = this.extractRiderAttachment(eventCustomData);
      } catch (error) {
        console.error('Error extracting rider attachment:', error);
        }
      }
      
      // Check specifiek voor balletvloer en vleugel uit resources (resource booking = expliciete "ja")
      let hasBalletvloer = resources.some(r => {
        const rLower = r.toLowerCase();
        return rLower.includes('balletvloer') || rLower.includes('ballet');
      });
      let balletvloerExplicit = hasBalletvloer;
      let hasVleugel = resources.some(r => {
        const rLower = r.toLowerCase();
        return rLower.includes('vleugel') || rLower.includes('piano');
      });
      let vleugelExplicit = hasVleugel;
      let hasOrkestbak = resources.some(r => {
        const rLower = r.toLowerCase();
        return rLower.includes('orkestbak');
      });
      let orkestbakExplicit = hasOrkestbak;
      let orkestbakValue = null;
      const toOrkestbakDisplay = (val) => {
        const v = toEffectiveValue(val);
        if (v == null || v === '') return null;
        if (typeof v === 'string') {
          const t = v.trim();
          if (t.toLowerCase() === 'nee' || t.toLowerCase() === 'no') return 'nee';
          return t || null;
        }
        return (v === true || v === 1) ? 'ja' : null;
      };
      
      // Haal effectieve waarde uit object (Yesplan dropdowns kunnen { name: "Ja" } retourneren)
      const toEffectiveValue = (v) => {
        if (v == null) return null;
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
        if (typeof v === 'object') return v.value ?? v.name ?? v.label ?? v.text ?? null;
        return null;
      };
      // Helper functie om een waarde te checken op "Ja"/"Yes"/true/1
      const isTrueValue = (value) => {
        const v = toEffectiveValue(value);
        if (v === true || v === 1 || v === '1') return true;
        if (typeof v === 'string') {
          const lower = v.toLowerCase().trim();
          return lower === 'ja' || lower === 'yes' || lower === 'true';
        }
        return false;
      };
      const isOrkestbakValue = (value) => {
        const v = toEffectiveValue(value);
        if (v == null || v === '') return false;
        if (v === true || v === 1) return true;
        if (typeof v === 'string') {
          const lower = v.toLowerCase().trim();
          if (lower === 'nee' || lower === 'no') return false;
          return lower.length > 0;
        }
        return false;
      };
      // Waarde geeft aan dat de gebruiker iets heeft ingevuld (ja, nee, of orkestbak-beschrijving)
      const valueIndicatesUserInput = (value, forOrkestbak = false) => {
        const v = toEffectiveValue(value);
        if (v == null) return false;
        if (typeof v === 'string') {
          const t = v.trim();
          if (t === '') return false;
          return true;
        }
        if (forOrkestbak) return v === true || v === 1 || v === false || v === 0;
        return v === true || v === 1 || v === false || v === 0;
      };
      
      // Check ook direct in raw event voor technische lijst (production.technical_list)
      if (event.production && event.production.technical_list) {
        const techList = event.production.technical_list;
        
        // Als het een object is, check alle properties
        if (typeof techList === 'object' && !Array.isArray(techList)) {
          for (const key in techList) {
            if (!techList.hasOwnProperty(key)) continue;
            const keyLower = key.toLowerCase();
            const value = techList[key];
            
            if ((keyLower.includes('balletvloer') || keyLower.includes('ballet')) && valueIndicatesUserInput(value)) {
              balletvloerExplicit = true;
              if (!hasBalletvloer && isTrueValue(value)) hasBalletvloer = true;
            }
            if ((keyLower.includes('vleugel') || keyLower.includes('piano')) && valueIndicatesUserInput(value)) {
              vleugelExplicit = true;
              if (!hasVleugel && isTrueValue(value)) hasVleugel = true;
            }
            if ((keyLower.includes('orkestbak') || keyLower.includes('orkest')) && valueIndicatesUserInput(value, true)) {
              orkestbakExplicit = true;
              if (!hasOrkestbak && isOrkestbakValue(value)) {
                hasOrkestbak = true;
                orkestbakValue = orkestbakValue || toOrkestbakDisplay(value);
              } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(value);
            }
          }
        }
        
        // Als het een array is, check elk item
        if (Array.isArray(techList)) {
          techList.forEach(item => {
            if (item && typeof item === 'object') {
              for (const key in item) {
                if (!item.hasOwnProperty(key)) continue;
                const keyLower = key.toLowerCase();
                const value = item[key];
                
                if ((keyLower.includes('balletvloer') || keyLower.includes('ballet')) && valueIndicatesUserInput(value)) {
                  balletvloerExplicit = true;
                  if (!hasBalletvloer && isTrueValue(value)) hasBalletvloer = true;
                }
                if ((keyLower.includes('vleugel') || keyLower.includes('piano')) && valueIndicatesUserInput(value)) {
                  vleugelExplicit = true;
                  if (!hasVleugel && isTrueValue(value)) hasVleugel = true;
                }
                if ((keyLower.includes('orkestbak') || keyLower.includes('orkest')) && valueIndicatesUserInput(value, true)) {
                  orkestbakExplicit = true;
                  if (!hasOrkestbak && isOrkestbakValue(value)) {
                    hasOrkestbak = true;
                    orkestbakValue = orkestbakValue || toOrkestbakDisplay(value);
                  } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(value);
                }
              }
            }
          });
        }
      }
      
      // Check production.properties voor technische lijst
      if (event.production && event.production.properties && Array.isArray(event.production.properties)) {
        event.production.properties.forEach(prop => {
          if (prop.name) {
            const propName = prop.name.toLowerCase();
            const propValue = prop.value;
            
            if ((propName.includes('balletvloer') || propName.includes('ballet')) && valueIndicatesUserInput(propValue)) {
              balletvloerExplicit = true;
              if (!hasBalletvloer && isTrueValue(propValue)) hasBalletvloer = true;
            }
            if ((propName.includes('vleugel') || propName.includes('piano')) && valueIndicatesUserInput(propValue)) {
              vleugelExplicit = true;
              if (!hasVleugel && isTrueValue(propValue)) hasVleugel = true;
            }
            if ((propName.includes('orkestbak') || propName.includes('orkest')) && valueIndicatesUserInput(propValue, true)) {
              orkestbakExplicit = true;
              if (!hasOrkestbak && isOrkestbakValue(propValue)) {
                hasOrkestbak = true;
                orkestbakValue = orkestbakValue || toOrkestbakDisplay(propValue);
              } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(propValue);
            }
          }
        });
      }
      
      // Check properties voor technische lijst
      if (event.properties && Array.isArray(event.properties)) {
        event.properties.forEach(prop => {
          if (prop.name) {
            const propName = prop.name.toLowerCase();
            const propValue = prop.value;
            
            if ((propName.includes('balletvloer') || propName.includes('ballet')) && valueIndicatesUserInput(propValue)) {
              balletvloerExplicit = true;
              if (!hasBalletvloer && isTrueValue(propValue)) hasBalletvloer = true;
            }
            if ((propName.includes('vleugel') || propName.includes('piano')) && valueIndicatesUserInput(propValue)) {
              vleugelExplicit = true;
              if (!hasVleugel && isTrueValue(propValue)) hasVleugel = true;
            }
            if ((propName.includes('orkestbak') || propName.includes('orkest')) && valueIndicatesUserInput(propValue, true)) {
              orkestbakExplicit = true;
              if (!hasOrkestbak && isOrkestbakValue(propValue)) {
                hasOrkestbak = true;
                orkestbakValue = orkestbakValue || toOrkestbakDisplay(propValue);
              } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(propValue);
            }
          }
        });
      }
      
      // Check event.technical_list direct
      if (event.technical_list) {
        const techList = event.technical_list;
        if (typeof techList === 'object' && !Array.isArray(techList)) {
          for (const key in techList) {
            if (!techList.hasOwnProperty(key)) continue;
            const keyLower = key.toLowerCase();
            const value = techList[key];
            
            if ((keyLower.includes('balletvloer') || keyLower.includes('ballet')) && valueIndicatesUserInput(value)) {
              balletvloerExplicit = true;
              if (!hasBalletvloer && isTrueValue(value)) hasBalletvloer = true;
            }
            if ((keyLower.includes('vleugel') || keyLower.includes('piano')) && valueIndicatesUserInput(value)) {
              vleugelExplicit = true;
              if (!hasVleugel && isTrueValue(value)) hasVleugel = true;
            }
            if ((keyLower.includes('orkestbak') || keyLower.includes('orkest')) && valueIndicatesUserInput(value, true)) {
              orkestbakExplicit = true;
              if (!hasOrkestbak && isOrkestbakValue(value)) {
                hasOrkestbak = true;
                orkestbakValue = orkestbakValue || toOrkestbakDisplay(value);
              } else if (!orkestbakValue) orkestbakValue = toOrkestbakDisplay(value);
            }
          }
        }
      }
      
      // eventCustomData: zet explicit ALLEEN bij technische lijst velden als er een echte waarde is
      // Lege/ontbrekende velden = geen info = "niet bekend", niet "nee"
      if (eventCustomData) {
        const hasExplicitValue = (value) => {
          const v = toEffectiveValue(value);
          if (v == null) return false;
          if (typeof v === 'string') {
            const t = v.trim();
            if (t === '') return false;
            return true; // ja, nee, of orkestbak-beschrijving = gebruiker heeft ingevuld
          }
          return v === true || v === false || v === 1 || v === 0;
        };
        const setExplicitFromCustomData = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          const kw = (obj.keyword || obj.name || '').toLowerCase();
          const value = obj.value;
          if (kw.includes('technischelijst') && hasExplicitValue(value)) {
            if (kw.includes('balletvloer')) balletvloerExplicit = true;
            if (kw.includes('vleugel')) vleugelExplicit = true;
            if (kw.includes('orkestbak') || kw.includes('orkest')) orkestbakExplicit = true;
          }
          if (obj.children) obj.children.forEach(setExplicitFromCustomData);
          if (obj.groups) obj.groups.forEach(setExplicitFromCustomData);
          for (const k in obj) {
            if (!['children', 'groups'].includes(k) && obj[k] && typeof obj[k] === 'object') setExplicitFromCustomData(obj[k]);
          }
        };
        setExplicitFromCustomData(eventCustomData);
      }
      
      // Haal "boeking beheerd door" / verantwoordelijke op
      let bookingManager = null;
      const fullEvent = eventDetails ? { ...event, ...eventDetails } : event;
      if (fullEvent.responsible && (typeof fullEvent.responsible === 'string' || fullEvent.responsible?.name)) {
        bookingManager = typeof fullEvent.responsible === 'string' ? fullEvent.responsible : (fullEvent.responsible.name || null);
      }
      if (!bookingManager && fullEvent.responsible_contact) {
        const rc = fullEvent.responsible_contact;
        bookingManager = rc.name || rc.contact?.name || (typeof rc === 'string' ? rc : null);
      }
      if (!bookingManager && fullEvent.contactbookings && Array.isArray(fullEvent.contactbookings)) {
        const roles = ['artistieke zaken', 'boeking', 'verantwoordelijke', 'beheerder', 'contact'];
        for (const cb of fullEvent.contactbookings) {
          const roleName = (cb.role?.name || cb.role || '').toLowerCase();
          const contactName = cb.contact?.name || cb.contact?.firstname || cb.name;
          if (contactName && roles.some(r => roleName.includes(r))) {
            bookingManager = contactName;
            break;
          }
          if (contactName && !bookingManager) bookingManager = contactName;
        }
      }
      if (!bookingManager && eventCustomData) {
        const findBookingManager = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          const kw = (obj.keyword || obj.name || '').toLowerCase();
          const names = ['verantwoordelijk', 'beheerd', 'artistieke', 'boeking', 'contact', 'responsible'];
          if (names.some(n => kw.includes(n))) {
            const v = obj.value;
            if (v && typeof v === 'string' && v.trim() && !/^(nee|no)$/i.test(v.trim())) return v.trim();
            if (v && typeof v === 'object' && v.name) return v.name;
          }
          if (obj.children) for (const c of obj.children) { const r = findBookingManager(c); if (r) return r; }
          if (obj.groups) for (const g of obj.groups) { const r = findBookingManager(g); if (r) return r; }
          for (const key in obj) {
            if (!['children', 'groups'].includes(key) && obj[key] && typeof obj[key] === 'object') {
              const r = findBookingManager(obj[key]);
              if (r) return r;
            }
          }
          return null;
        };
        bookingManager = findBookingManager(eventCustomData);
      }
      
      // Haal orkestbak waarde uit eventCustomData (TECHNISCHE LIJST)
      if (!orkestbakValue && eventCustomData) {
        const findOrkestValue = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          const kw = (obj.keyword || obj.name || '').toLowerCase();
          if ((kw.includes('orkestbak') || kw.includes('orkest')) && kw.includes('technischelijst')) {
            const v = toOrkestbakDisplay(obj.value);
            if (v) return v;
          }
          if (obj.children) {
            for (const c of obj.children) {
              const r = findOrkestValue(c);
              if (r) return r;
            }
          }
          if (obj.groups) {
            for (const g of obj.groups) {
              const r = findOrkestValue(g);
              if (r) return r;
            }
          }
          for (const key in obj) {
            if (key !== 'children' && key !== 'groups' && obj[key] && typeof obj[key] === 'object') {
              const r = findOrkestValue(obj[key]);
              if (r) return r;
            }
          }
          return null;
        };
        orkestbakValue = findOrkestValue(eventCustomData);
      }
      
      // Haal verkoopdata op (mogelijk verschillende veldnamen)
      // Prioriteit: customdata (ITIX/AANTAL BEZOEKERS) > ticketingData > event.ticketing > event velden
      let capacity = 0;
      let soldTickets = 0;
      let ticketsReserved = 0;
      let revenue = 0;
      let aantalGasten = 0;
      
      // Eerst proberen uit customdata (ITIX sectie onder DEAL)
      if (eventCustomData && eventCustomData.groups) {
        // Zoek naar DEAL groep
        const dealGroup = eventCustomData.groups.find(g => 
          g.name && g.name.includes('DEAL')
        ) || eventCustomData.groups.find(g => 
          g.keyword && g.keyword.toLowerCase().includes('deal')
        );
        
        if (dealGroup && dealGroup.children) {
          // Zoek naar ITIX child binnen DEAL
          const itixChild = dealGroup.children.find(c => 
            c.name && c.name.includes('ITIX')
          ) || dealGroup.children.find(c => 
            c.keyword && c.keyword.toLowerCase().includes('itix')
          );
          
          if (itixChild && itixChild.children) {
            // Zoek naar verkoopdata velden in ITIX sub-children
            itixChild.children.forEach(subChild => {
              if (subChild.name && subChild.value !== null && subChild.value !== undefined) {
                const nameLower = subChild.name.toLowerCase();
                const keywordLower = (subChild.keyword || '').toLowerCase();
                const value = subChild.value;
                
                // Check op keyword (meer betrouwbaar)
                if (keywordLower.includes('capaciteit') || keywordLower === 'deal_itix_capaciteit') {
                  capacity = parseInt(value) || 0;
                } else if (keywordLower.includes('verkocht') || keywordLower === 'deal_itix_verkocht') {
                  soldTickets = parseInt(value) || 0;
                } else if (keywordLower.includes('beschikbaar') || keywordLower === 'deal_itix_beschikbaar') {
                  // Beschikbaar = capacity - sold, dus niet nodig om op te slaan
                } else if (keywordLower.includes('gereserveerd') || keywordLower === 'deal_itix_gereserveerd') {
                  ticketsReserved = parseInt(value) || 0;
                } else if (keywordLower.includes('brutorecette') || keywordLower === 'deal_itix_brutorecette') {
                  revenue = parseFloat(value) || 0;
                } else if (keywordLower.includes('gasten') || keywordLower.includes('guests') || keywordLower === 'deal_itix_aantalgazten') {
                  aantalGasten = parseInt(value) || 0;
                }
                
                // Fallback op name als keyword niet werkt
                if (capacity === 0 && (nameLower.includes('capaciteit') || nameLower.includes('capacity'))) {
                  capacity = parseInt(value) || 0;
                }
                if (soldTickets === 0 && (nameLower.includes('verkocht') || nameLower.includes('sold'))) {
                  soldTickets = parseInt(value) || 0;
                }
                if (ticketsReserved === 0 && (nameLower.includes('gereserveerd') || nameLower.includes('reserved'))) {
                  ticketsReserved = parseInt(value) || 0;
                }
                if (revenue === 0 && (nameLower.includes('recette') || nameLower.includes('revenue'))) {
                  revenue = parseFloat(value) || 0;
                }
                if (aantalGasten === 0 && (nameLower.includes('gasten') || nameLower.includes('guests'))) {
                  aantalGasten = parseInt(value) || 0;
                }
              }
            });
          }
        }
      }
      
      // Haal ticketingId op uit DEAL > ITIX customdata
      let ticketingIdFromCustomData = null;
      if (eventCustomData && eventCustomData.groups) {
        const dealGroup = eventCustomData.groups.find(g => 
          g.name && g.name.includes('DEAL')
        ) || eventCustomData.groups.find(g => 
          g.keyword && g.keyword.toLowerCase().includes('deal')
        );
        
        if (dealGroup && dealGroup.children) {
          const itixChild = dealGroup.children.find(c => 
            c.name && c.name.includes('ITIX')
          ) || dealGroup.children.find(c => 
            c.keyword && c.keyword.toLowerCase().includes('itix')
          );
          
          if (itixChild && itixChild.children) {
            itixChild.children.forEach(subChild => {
              if (subChild.name && subChild.value !== null && subChild.value !== undefined) {
                const nameLower = subChild.name.toLowerCase();
                const keywordLower = (subChild.keyword || '').toLowerCase();
                
                // Zoek naar ticketing ID velden
                if (keywordLower.includes('ticketing') && keywordLower.includes('id') && !keywordLower.includes('group')) {
                  ticketingIdFromCustomData = String(subChild.value).trim();
                } else if (nameLower.includes('ticketing') && nameLower.includes('id') && !nameLower.includes('group')) {
                  ticketingIdFromCustomData = String(subChild.value).trim();
                }
              }
            });
          }
        }
      }
      
      // Fallback naar ticketingData
      if (capacity === 0 && ticketingData) {
        capacity = ticketingData.capacity || ticketingData.max_capacity || ticketingData.total_capacity || 0;
        soldTickets = ticketingData.sold || ticketingData.sold_tickets || ticketingData.tickets_sold || ticketingData.booked || 0;
        ticketsReserved = ticketingData.reserved || ticketingData.tickets_reserved || 0;
        revenue = ticketingData.revenue || ticketingData.total_revenue || ticketingData.sales_revenue || 0;
      }
      
      // Fallback naar event.ticketing
      if (capacity === 0 && event.ticketing) {
        capacity = event.ticketing.capacity || event.ticketing.max_capacity || 0;
        soldTickets = event.ticketing.sold || event.ticketing.sold_tickets || 0;
        ticketsReserved = parseInt(event.ticketing.reserved) || 0;
        revenue = event.ticketing.revenue || 0;
      }
      
      // Fallback naar event velden
      if (capacity === 0) {
        capacity = event.capacity || event.max_capacity || event.total_capacity || 0;
      }
      if (soldTickets === 0) {
        soldTickets = event.sold_tickets || event.tickets_sold || event.sold || event.booked_tickets || 0;
      }
      if (revenue === 0) {
        revenue = event.revenue || event.total_revenue || event.sales_revenue || 0;
      }
      
      // Haal reserveringen op (van Itix naar Yesplan) - fallback
      if (ticketsReserved === 0) {
        if (event.itix_data && event.itix_data.Gereserveerd) {
          ticketsReserved = parseInt(event.itix_data.Gereserveerd) || 0;
        } else if (event.properties && Array.isArray(event.properties)) {
          const reservedProp = event.properties.find(p => 
            p.name && (p.name.toLowerCase().includes('gereserveerd') || 
                      p.name.toLowerCase().includes('reserved') ||
                      p.name.toLowerCase().includes('itix'))
          );
          if (reservedProp && reservedProp.value) {
            ticketsReserved = parseInt(reservedProp.value) || 0;
          }
        }
      }
      
      const availableTickets = capacity > 0 ? capacity - soldTickets : 0;
      const soldPercentage = capacity > 0 ? Math.round((soldTickets / capacity) * 100) : 0;
      
      // Haal ticketingId op uit verschillende bronnen (prioriteit: customdata > ticketingData > event.ticketing)
      const ticketingId = ticketingIdFromCustomData || ticketingData?.id || ticketingData?.ticketing_id || event.ticketing?.id || event.ticketing_id || null;
      
      // Bouw event URL voor web interface (niet API endpoint)
      // Yesplan ondersteunt geen directe links naar events via URL parameters
      // URL wordt niet gebruikt, maar behouden voor eventuele toekomstige functionaliteit
      let eventUrl = null;
      
      return {
        id: event.id,
        title: event.name || 'Geen titel',
        performer: performer,
        startDate: startTime,
        endDate: endTime,
        venue: locations,
        venueIds: venueIds,
        status: event.status?.name || event.status || 'unknown',
        bookingManager: bookingManager || null,
        capacity: capacity,
        soldTickets: soldTickets,
        availableTickets: availableTickets,
        soldPercentage: soldPercentage,
        revenue: revenue,
        ticketsReserved: ticketsReserved,
        aantalGasten: aantalGasten,
        ticketingId: ticketingId,
        // Schedule informatie
        scheduleStartTime: scheduleStartTime,
        scheduleEndTime: scheduleEndTime,
        scheduleDescription: scheduleDescription,
        scheduleStart: event.defaultschedulestart,
        scheduleEnd: event.defaultscheduleend,
        // Resources
        resources: resources,
        technicalMaterialResources: technicalMaterialResources,
        
        // Ureninfo (Uurwerk personeelsplanning)
        urenInfo: urenInfo,
        hasBalletvloer: hasBalletvloer,
        hasVleugel: hasVleugel,
        hasOrkestbak: hasOrkestbak,
        orkestbakValue: orkestbakValue || (hasOrkestbak ? 'ja' : null),
        balletvloerExplicit,
        vleugelExplicit,
        orkestbakExplicit,
        // Bijlage/rider informatie (backwards compatibility)
        riderAttachment: riderAttachment,
        // Alle documenten uit TECHNISCHE LIJST
        technicalListDocuments: technicalListDocuments,
        // Technische opmerkingen
        technicalRemarks: technicalRemarks,
        // Volledige event voor extra informatie
        rawEvent: event,
        // Event URL voor "open in yesplan" knop
        url: eventUrl,
        formattedStartDate: startTime ? format(parseISO(startTime), 'dd-MM-yyyy HH:mm') : '',
        formattedEndDate: endTime ? format(parseISO(endTime), 'dd-MM-yyyy HH:mm') : ''
      };
    });
    } catch (error) {
      console.error('Error in formatEvents:', error);
      // Return lege array bij error om app niet te crashen
      return [];
    }
  }

  formatEventDetails(event) {
    const resources = this.extractResources(event);
    
    return {
      id: event.id,
      title: event.name,
      description: event.description,
      startDate: event.start_date,
      endDate: event.end_date,
      venue: event.venue,
      capacity: event.capacity,
      soldTickets: event.sold_tickets,
      revenue: event.revenue,
      status: event.status,
      categories: event.categories || [],
      artists: event.artists || [],
      pricing: event.pricing || [],
      resources: resources,
      hasBalletvloer: resources.some(r => r.toLowerCase().includes('balletvloer') || r.toLowerCase().includes('ballet')),
      hasVleugel: resources.some(r => r.toLowerCase().includes('vleugel') || r.toLowerCase().includes('piano')),
      hasOrkestbak: resources.some(r => r.toLowerCase().includes('orkestbak')),
      orkestbakValue: null
    };
  }

  // Test verbinding
  async testConnection() {
    try {
      // Test met een simpele events call
      const queryString = this.addApiKey({ limit: 1 });
      const url = queryString ? `/api/events?${queryString}` : '/api/events';
      
      const response = await this.client.get(url);
      return {
        success: true,
        message: 'Verbinding succesvol'
      };
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return {
            success: false,
            message: 'API key is ongeldig'
          };
        } else if (error.response.status === 403) {
          return {
            success: false,
            message: 'Geen toegang met deze API key'
          };
        }
      }
      return {
        success: false,
        message: `Verbindingsfout: ${error.message}`
      };
    }
  }
}

module.exports = YesplanAPI;

