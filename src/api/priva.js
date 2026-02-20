const axios = require('axios');
const { format, parseISO } = require('date-fns');

class PrivaAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.apiKey = config.apiKey || '';
    this.systemId = config.systemId || '';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
  }

  async getClimateData(params = {}) {
    try {
      const { startDate, endDate, sensors, venueId, location } = params;
      
      const queryParams = new URLSearchParams({
        system: this.systemId
      });

      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);
      if (sensors) queryParams.append('sensors', sensors.join(','));
      if (venueId) queryParams.append('venue', venueId);
      if (location) queryParams.append('location', location);

      const response = await this.client.get(`/climate?${queryParams}`);
      
      return {
        success: true,
        data: this.formatClimateData(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Priva API Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async getCurrentStatus() {
    try {
      const response = await this.client.get(`/status?system=${this.systemId}`);
      
      return {
        success: true,
        data: this.formatStatus(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Priva Status Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async getSensors() {
    try {
      const response = await this.client.get(`/sensors?system=${this.systemId}`);
      
      return {
        success: true,
        data: this.formatSensors(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Priva Sensors Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async getHistory(params = {}) {
    try {
      const { startDate, endDate, sensorId, interval = 'hour' } = params;
      
      const queryParams = new URLSearchParams({
        system: this.systemId,
        interval: interval
      });

      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);
      if (sensorId) queryParams.append('sensor', sensorId);

      const response = await this.client.get(`/history?${queryParams}`);
      
      return {
        success: true,
        data: this.formatHistory(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Priva History Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async getAlarms() {
    try {
      const response = await this.client.get(`/alarms?system=${this.systemId}`);
      
      return {
        success: true,
        data: this.formatAlarms(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Priva Alarms Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  formatClimateData(data) {
    if (!data) return null;

    return {
      temperature: data.temperature || null,
      humidity: data.humidity || null,
      co2: data.co2 || null,
      airQuality: data.air_quality || null,
      ventilation: data.ventilation || null,
      pressure: data.pressure || null,
      lastUpdate: data.last_update ? format(parseISO(data.last_update), 'dd-MM-yyyy HH:mm') : null,
      systemStatus: data.system_status || 'unknown',
      energyConsumption: data.energy_consumption || null,
      efficiency: data.efficiency || null
    };
  }

  formatStatus(status) {
    if (!status) return null;

    return {
      systemId: status.system_id,
      systemName: status.system_name,
      status: status.status || 'unknown',
      lastMaintenance: status.last_maintenance,
      nextMaintenance: status.next_maintenance,
      operatingHours: status.operating_hours || 0,
      energyEfficiency: status.energy_efficiency || null,
      filterStatus: status.filter_status || 'unknown',
      formattedLastMaintenance: status.last_maintenance ? format(parseISO(status.last_maintenance), 'dd-MM-yyyy') : null,
      formattedNextMaintenance: status.next_maintenance ? format(parseISO(status.next_maintenance), 'dd-MM-yyyy') : null
    };
  }

  formatSensors(sensors) {
    if (!Array.isArray(sensors)) return [];
    
    return sensors.map(sensor => ({
      id: sensor.id,
      name: sensor.name,
      type: sensor.type,
      location: sensor.location,
      status: sensor.status || 'active',
      lastReading: sensor.last_reading,
      unit: sensor.unit,
      minValue: sensor.min_value,
      maxValue: sensor.max_value,
      currentValue: sensor.current_value,
      formattedLastReading: sensor.last_reading ? format(parseISO(sensor.last_reading), 'dd-MM-yyyy HH:mm') : null
    }));
  }

  formatHistory(history) {
    if (!Array.isArray(history)) return [];
    
    return history.map(record => ({
      timestamp: record.timestamp,
      sensorId: record.sensor_id,
      sensorName: record.sensor_name,
      value: record.value,
      unit: record.unit,
      status: record.status,
      formattedTimestamp: record.timestamp ? format(parseISO(record.timestamp), 'dd-MM-yyyy HH:mm') : null
    }));
  }

  formatAlarms(alarms) {
    if (!Array.isArray(alarms)) return [];
    
    return alarms.map(alarm => ({
      id: alarm.id,
      sensorId: alarm.sensor_id,
      sensorName: alarm.sensor_name,
      type: alarm.type,
      severity: alarm.severity,
      message: alarm.message,
      timestamp: alarm.timestamp,
      status: alarm.status,
      acknowledged: alarm.acknowledged || false,
      formattedTimestamp: alarm.timestamp ? format(parseISO(alarm.timestamp), 'dd-MM-yyyy HH:mm') : null
    }));
  }

  // Test verbinding
  async testConnection() {
    try {
      const response = await this.client.get('/systems');
      return {
        success: true,
        message: 'Verbinding succesvol'
      };
    } catch (error) {
      return {
        success: false,
        message: `Verbindingsfout: ${error.message}`
      };
    }
  }
}

module.exports = PrivaAPI;

