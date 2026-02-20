const axios = require('axios');
const { format, parseISO } = require('date-fns');

class UurwerkAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.apiKey = config.apiKey || '';
    this.companyId = config.companyId || '';
    
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

  async getSchedule(params = {}) {
    try {
      const { startDate, endDate, department, venueId, location } = params;
      
      const queryParams = new URLSearchParams({
        company: this.companyId
      });

      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);
      if (department) queryParams.append('department', department);
      if (venueId) queryParams.append('venue', venueId);
      if (location) queryParams.append('location', location);

      const response = await this.client.get(`/schedules?${queryParams}`);
      
      return {
        success: true,
        data: this.formatSchedule(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Uurwerk API Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async getEmployees() {
    try {
      const response = await this.client.get(`/employees?company=${this.companyId}`);
      
      return {
        success: true,
        data: this.formatEmployees(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Uurwerk Employees Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async getShifts(params = {}) {
    try {
      const { startDate, endDate, employeeId } = params;
      
      const queryParams = new URLSearchParams({
        company: this.companyId
      });

      if (startDate) queryParams.append('start', startDate);
      if (endDate) queryParams.append('end', endDate);
      if (employeeId) queryParams.append('employee', employeeId);

      const response = await this.client.get(`/shifts?${queryParams}`);
      
      return {
        success: true,
        data: this.formatShifts(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Uurwerk Shifts Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async getDepartments() {
    try {
      const response = await this.client.get(`/departments?company=${this.companyId}`);
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Uurwerk Departments Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  formatSchedule(schedule) {
    if (!Array.isArray(schedule)) return [];
    
    return schedule.map(shift => ({
      id: shift.id,
      employeeId: shift.employee_id,
      employeeName: shift.employee?.name || 'Onbekend',
      department: shift.department?.name || 'Onbekend',
      startTime: shift.start_time,
      endTime: shift.end_time,
      date: shift.date,
      status: shift.status || 'scheduled',
      role: shift.role || 'Medewerker',
      location: shift.location || 'Theater',
      formattedStartTime: shift.start_time ? format(parseISO(shift.start_time), 'HH:mm') : '',
      formattedEndTime: shift.end_time ? format(parseISO(shift.end_time), 'HH:mm') : '',
      formattedDate: shift.date ? format(parseISO(shift.date), 'dd-MM-yyyy') : ''
    }));
  }

  formatEmployees(employees) {
    if (!Array.isArray(employees)) return [];
    
    return employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department?.name || 'Onbekend',
      role: employee.role || 'Medewerker',
      status: employee.status || 'active',
      hireDate: employee.hire_date,
      formattedHireDate: employee.hire_date ? format(parseISO(employee.hire_date), 'dd-MM-yyyy') : ''
    }));
  }

  formatShifts(shifts) {
    if (!Array.isArray(shifts)) return [];
    
    return shifts.map(shift => ({
      id: shift.id,
      employeeId: shift.employee_id,
      employeeName: shift.employee?.name || 'Onbekend',
      startTime: shift.start_time,
      endTime: shift.end_time,
      date: shift.date,
      status: shift.status,
      hours: this.calculateHours(shift.start_time, shift.end_time),
      overtime: shift.overtime || 0,
      location: shift.location || 'Theater'
    }));
  }

  calculateHours(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100; // Rond af op 2 decimalen
  }

  // Test verbinding
  async testConnection() {
    try {
      const response = await this.client.get('/companies');
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

module.exports = UurwerkAPI;

