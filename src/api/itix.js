const axios = require('axios');
const { format, parseISO } = require('date-fns');

class ItixAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.apiKey = config.apiKey || '';
    this.venueId = config.venueId || '';
    
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

  async getSales(params = {}) {
    try {
      const { startDate, endDate, limit = 50, venueId } = params;
      
      // Gebruik venueId uit params als opgegeven, anders uit config
      const venue = venueId || this.venueId;
      
      const queryParams = new URLSearchParams({
        venue: venue,
        limit: limit.toString()
      });

      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);

      const response = await this.client.get(`/sales?${queryParams}`);
      
      return {
        success: true,
        data: this.formatSales(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Itix API Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async getEvents(params = {}) {
    try {
      const { startDate, endDate, venueId } = params;
      
      // Gebruik venueId uit params als opgegeven, anders uit config
      const venue = venueId || this.venueId;
      
      const queryParams = new URLSearchParams();
      if (venue) queryParams.append('venue', venue);
      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);

      const response = await this.client.get(`/events?${queryParams}`);
      
      // Check of response.data een array is of een object met data property
      const events = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      return {
        success: true,
        data: this.formatEvents(events),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Itix Events Error:', error.message);
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

  async getTickets(params = {}) {
    try {
      const { eventId, startDate, endDate } = params;
      
      const queryParams = new URLSearchParams({
        venue: this.venueId
      });

      if (eventId) queryParams.append('event', eventId);
      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);

      const response = await this.client.get(`/tickets?${queryParams}`);
      
      return {
        success: true,
        data: this.formatTickets(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Itix Tickets Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async getRevenue(params = {}) {
    try {
      const { startDate, endDate, groupBy = 'day' } = params;
      
      const queryParams = new URLSearchParams({
        venue: this.venueId,
        group_by: groupBy
      });

      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);

      const response = await this.client.get(`/revenue?${queryParams}`);
      
      return {
        success: true,
        data: this.formatRevenue(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Itix Revenue Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  formatSales(sales) {
    if (!Array.isArray(sales)) return [];
    
    return sales.map(sale => ({
      id: sale.id,
      eventId: sale.event_id,
      eventName: sale.event?.name || 'Onbekend evenement',
      date: sale.date,
      ticketsSold: sale.tickets_sold || 0,
      revenue: sale.revenue || 0,
      status: sale.status || 'completed',
      paymentMethod: sale.payment_method || 'unknown',
      customerEmail: sale.customer_email,
      formattedDate: sale.date ? format(parseISO(sale.date), 'dd-MM-yyyy HH:mm') : '',
      formattedRevenue: sale.revenue ? `€${sale.revenue.toFixed(2)}` : '€0.00'
    }));
  }

  formatEvents(events) {
    if (!Array.isArray(events)) return [];
    
    return events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      venue: event.venue?.name || 'Onbekend',
      capacity: event.capacity || event.Capaciteit || 0,
      ticketsSold: event.tickets_sold || event.Verkocht || 0,
      ticketsAvailable: event.tickets_available || event.Beschikbaar || 0,
      ticketsReserved: event.tickets_reserved || event.Gereserveerd || event.reserved || 0,
      freeTickets: event.free_tickets || event.Vrijkaarten || 0,
      revenue: event.revenue || event['Bruto recette'] || 0,
      ticketingId: event.ticketing_id || event['Ticketing ID'] || null,
      ticketingGroupId: event.ticketing_group_id || event['Ticketing group ID'] || null,
      status: event.status || 'active',
      formattedDate: event.date ? format(parseISO(event.date), 'dd-MM-yyyy HH:mm') : '',
      soldPercentage: event.capacity > 0 ? Math.round((event.tickets_sold / event.capacity) * 100) : 0,
      // Raw event voor extra data
      rawEvent: event
    }));
  }

  formatTickets(tickets) {
    if (!Array.isArray(tickets)) return [];
    
    return tickets.map(ticket => ({
      id: ticket.id,
      eventId: ticket.event_id,
      eventName: ticket.event?.name || 'Onbekend',
      seatNumber: ticket.seat_number,
      price: ticket.price || 0,
      status: ticket.status || 'sold',
      customerName: ticket.customer_name,
      customerEmail: ticket.customer_email,
      purchaseDate: ticket.purchase_date,
      formattedPrice: ticket.price ? `€${ticket.price.toFixed(2)}` : '€0.00',
      formattedPurchaseDate: ticket.purchase_date ? format(parseISO(ticket.purchase_date), 'dd-MM-yyyy HH:mm') : ''
    }));
  }

  formatRevenue(revenue) {
    if (!Array.isArray(revenue)) return [];
    
    return revenue.map(item => ({
      date: item.date,
      totalRevenue: item.total_revenue || 0,
      ticketCount: item.ticket_count || 0,
      averageTicketPrice: item.average_ticket_price || 0,
      formattedDate: item.date ? format(parseISO(item.date), 'dd-MM-yyyy') : '',
      formattedRevenue: item.total_revenue ? `€${item.total_revenue.toFixed(2)}` : '€0.00',
      formattedAveragePrice: item.average_ticket_price ? `€${item.average_ticket_price.toFixed(2)}` : '€0.00'
    }));
  }

  // Test verbinding
  async testConnection() {
    try {
      const response = await this.client.get('/venues');
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

module.exports = ItixAPI;

