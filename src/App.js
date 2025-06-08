import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BarChart3, Car, Calendar, MapPin, Fuel, DollarSign, Wrench } from 'lucide-react';

const CargoTransportCRM = () => {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('trips');
  const [selectedCar, setSelectedCar] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState(50); // Ціна за літр палива
  
  const [formData, setFormData] = useState({
    startOdometer: '',
    endOdometer: '',
    startDate: '',
    endDate: '',
    carNumber: '',
    route: '',
    fuelAmount: '',
    fuelPricePerLiter: 50,
    freightSum: '',
    unexpectedExpenses: '',
    repairExpenses: ''
  });

  // Завантаження даних з localStorage при ініціалізації
  useEffect(() => {
    const savedTrips = localStorage.getItem('cargoTrips');
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }
  }, []);

  // Збереження даних в localStorage при зміні trips
  useEffect(() => {
    localStorage.setItem('cargoTrips', JSON.stringify(trips));
  }, [trips]);

  // Розрахунок суточних
  const calculateDailyAllowance = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 200;
  };

  // Розрахунок зарплати водія
  const calculateDriverSalary = (freightSum, fuelAmount, fuelPrice, dailyAllowance) => {
    const fuelCost = fuelAmount * fuelPrice;
    const netAmount = freightSum - fuelCost - dailyAllowance;
    return Math.max(0, netAmount / 4);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    
    const dailyAllowance = calculateDailyAllowance(formData.startDate, formData.endDate);
    const driverSalary = calculateDriverSalary(
      parseFloat(formData.freightSum) || 0,
      parseFloat(formData.fuelAmount) || 0,
      parseFloat(formData.fuelPricePerLiter) || 50,
      dailyAllowance
    );

    const tripData = {
      id: editingTrip ? editingTrip.id : Date.now(),
      ...formData,
      startOdometer: parseInt(formData.startOdometer) || 0,
      endOdometer: parseInt(formData.endOdometer) || 0,
      fuelAmount: parseFloat(formData.fuelAmount) || 0,
      fuelPricePerLiter: parseFloat(formData.fuelPricePerLiter) || 50,
      freightSum: parseFloat(formData.freightSum) || 0,
      unexpectedExpenses: parseFloat(formData.unexpectedExpenses) || 0,
      repairExpenses: parseFloat(formData.repairExpenses) || 0,
      dailyAllowance,
      driverSalary,
      distance: (parseInt(formData.endOdometer) || 0) - (parseInt(formData.startOdometer) || 0)
    };

    if (editingTrip) {
      setTrips(prev => prev.map(trip => trip.id === editingTrip.id ? tripData : trip));
    } else {
      setTrips(prev => [...prev, tripData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      startOdometer: '',
      endOdometer: '',
      startDate: '',
      endDate: '',
      carNumber: '',
      route: '',
      fuelAmount: '',
      fuelPricePerLiter: 50,
      freightSum: '',
      unexpectedExpenses: '',
      repairExpenses: ''
    });
    setShowForm(false);
    setEditingTrip(null);
  };

  const handleEdit = (trip) => {
    setFormData({
      startOdometer: trip.startOdometer.toString(),
      endOdometer: trip.endOdometer.toString(),
      startDate: trip.startDate,
      endDate: trip.endDate,
      carNumber: trip.carNumber,
      route: trip.route,
      fuelAmount: trip.fuelAmount.toString(),
      fuelPricePerLiter: trip.fuelPricePerLiter ? trip.fuelPricePerLiter.toString() : '50',
      freightSum: trip.freightSum.toString(),
      unexpectedExpenses: trip.unexpectedExpenses.toString(),
      repairExpenses: trip.repairExpenses.toString()
    });
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей рейс?')) {
      setTrips(prev => prev.filter(trip => trip.id !== id));
    }
  };

  // Статистика
  const statistics = {
    totalTrips: trips.length,
    totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
    totalFreight: trips.reduce((sum, trip) => sum + trip.freightSum, 0),
    totalFuel: trips.reduce((sum, trip) => sum + trip.fuelAmount, 0),
    totalFuelCost: trips.reduce((sum, trip) => sum + (trip.fuelAmount * (trip.fuelPricePerLiter || 50)), 0),
    totalDailyAllowances: trips.reduce((sum, trip) => sum + trip.dailyAllowance, 0),
    totalDriverSalaries: trips.reduce((sum, trip) => sum + trip.driverSalary, 0),
    totalRepairExpenses: trips.reduce((sum, trip) => sum + trip.repairExpenses, 0),
    totalUnexpectedExpenses: trips.reduce((sum, trip) => sum + trip.unexpectedExpenses, 0)
  };
  
  // Розрахунок чистого прибутку
  statistics.netProfit = statistics.totalFreight - 
    statistics.totalFuelCost - 
    statistics.totalDailyAllowances - 
    statistics.totalDriverSalaries - 
    statistics.totalRepairExpenses - 
    statistics.totalUnexpectedExpenses;

  // Отримання списку унікальних авто
  const uniqueCars = [...new Set(trips.map(trip => trip.carNumber))];

  // Фільтрація рейсів за авто та періодом
  const getFilteredTrips = () => {
    let filtered = trips;
    
    if (selectedCar) {
      filtered = filtered.filter(trip => trip.carNumber === selectedCar);
    }
    
    if (dateFrom && dateTo) {
      filtered = filtered.filter(trip => {
        const tripStartDate = new Date(trip.startDate);
        const filterFromDate = new Date(dateFrom);
        const filterToDate = new Date(dateTo);
        return tripStartDate >= filterFromDate && tripStartDate <= filterToDate;
      });
    }
    
    return filtered;
  };

  // Статистика по авто
  const getCarStatistics = (carNumber) => {
    const carTrips = trips.filter(trip => trip.carNumber === carNumber);
    const totalDistance = carTrips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalFreight = carTrips.reduce((sum, trip) => sum + trip.freightSum, 0);
    const totalFuel = carTrips.reduce((sum, trip) => sum + trip.fuelAmount, 0);
    const totalFuelCost = carTrips.reduce((sum, trip) => sum + (trip.fuelAmount * (trip.fuelPricePerLiter || 50)), 0);
    const totalDailyAllowances = carTrips.reduce((sum, trip) => sum + trip.dailyAllowance, 0);
    const totalDriverSalaries = carTrips.reduce((sum, trip) => sum + trip.driverSalary, 0);
    const totalRepairExpenses = carTrips.reduce((sum, trip) => sum + trip.repairExpenses, 0);
    const totalUnexpectedExpenses = carTrips.reduce((sum, trip) => sum + trip.unexpectedExpenses, 0);
    
    const netProfit = totalFreight - totalFuelCost - totalDailyAllowances - totalDriverSalaries - totalRepairExpenses - totalUnexpectedExpenses;
    
    return {
      trips: carTrips.length,
      distance: totalDistance,
      freight: totalFreight,
      fuel: totalFuel,
      fuelCost: totalFuelCost,
      dailyAllowances: totalDailyAllowances,
      driverSalaries: totalDriverSalaries,
      repairExpenses: totalRepairExpenses,
      unexpectedExpenses: totalUnexpectedExpenses,
      netProfit,
      pricePerKm: totalDistance > 0 ? totalFreight / totalDistance : 0
    };
  };

  // Статистика для відфільтрованих рейсів
  const getFilteredStatistics = () => {
    const filtered = getFilteredTrips();
    const totalDistance = filtered.reduce((sum, trip) => sum + trip.distance, 0);
    const totalFreight = filtered.reduce((sum, trip) => sum + trip.freightSum, 0);
    const totalFuel = filtered.reduce((sum, trip) => sum + trip.fuelAmount, 0);
    const totalFuelCost = filtered.reduce((sum, trip) => sum + (trip.fuelAmount * (trip.fuelPricePerLiter || 50)), 0);
    const totalDailyAllowances = filtered.reduce((sum, trip) => sum + trip.dailyAllowance, 0);
    const totalDriverSalaries = filtered.reduce((sum, trip) => sum + trip.driverSalary, 0);
    const totalRepairExpenses = filtered.reduce((sum, trip) => sum + trip.repairExpenses, 0);
    const totalUnexpectedExpenses = filtered.reduce((sum, trip) => sum + trip.unexpectedExpenses, 0);
    
    const netProfit = totalFreight - totalFuelCost - totalDailyAllowances - totalDriverSalaries - totalRepairExpenses - totalUnexpectedExpenses;
    
    return {
      totalTrips: filtered.length,
      totalDistance,
      totalFreight,
      totalFuel,
      totalFuelCost,
      totalDailyAllowances,
      totalDriverSalaries,
      totalRepairExpenses,
      totalUnexpectedExpenses,
      netProfit,
      pricePerKm: totalDistance > 0 ? totalFreight / totalDistance : 0
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Car className="text-blue-600" />
              CRM Вантажні перевезення
            </h1>
          </div>
          
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('trips')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'trips'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Рейси
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'statistics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Статистика
            </button>
            <button
              onClick={() => setActiveTab('cars')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'cars'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              По авто
            </button>
          </div>
        </div>

        {activeTab === 'trips' && (
          <>
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Рейси</h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Додати рейс
                </button>
              </div>

              {showForm && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    {editingTrip ? 'Редагувати рейс' : 'Новий рейс'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Спідометр (початок)
                      </label>
                      <input
                        type="number"
                        name="startOdometer"
                        value={formData.startOdometer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Спідометр (кінець)
                      </label>
                      <input
                        type="number"
                        name="endOdometer"
                        value={formData.endOdometer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Дата початку
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Дата кінця
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Номер авто
                      </label>
                      <input
                        type="text"
                        name="carNumber"
                        value={formData.carNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Маршрут
                      </label>
                      <input
                        type="text"
                        name="route"
                        value={formData.route}
                        onChange={handleInputChange}
                        placeholder="Київ - Львів"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Кількість палива (л)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="fuelAmount"
                        value={formData.fuelAmount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ціна палива (грн/л)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="fuelPricePerLiter"
                        value={formData.fuelPricePerLiter}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Сума фрахту (грн)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="freightSum"
                        value={formData.freightSum}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Непередбачувані витрати (грн)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="unexpectedExpenses"
                        value={formData.unexpectedExpenses}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Витрати на ремонт (грн)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="repairExpenses"
                        value={formData.repairExpenses}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 p-4 bg-blue-50 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Автоматичні розрахунки:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Суточні: </span>
                          <span className="font-medium">
                            {calculateDailyAllowance(formData.startDate, formData.endDate)} грн
                          </span>
                          <div>
                          <span className="text-gray-600">Зарплата водія: </span>
                          <span className="font-medium">
                            {calculateDriverSalary(
                              parseFloat(formData.freightSum) || 0,
                              parseFloat(formData.fuelAmount) || 0,
                              parseFloat(formData.fuelPricePerLiter) || 50,
                              calculateDailyAllowance(formData.startDate, formData.endDate)
                            ).toFixed(2)} грн
                          </span>
                        </div>
                      </div>
                        <div>
                          <span className="text-gray-600">Відстань: </span>
                          <span className="font-medium">
                            {(parseInt(formData.endOdometer) || 0) - (parseInt(formData.startOdometer) || 0)} км
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Вартість палива: </span>
                          <span className="font-medium">
                            {((parseFloat(formData.fuelAmount) || 0) * (parseFloat(formData.fuelPricePerLiter) || 50)).toFixed(2)} грн
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        {editingTrip ? 'Оновити' : 'Зберегти'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Скасувати
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Авто</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Маршрут</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дати</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Відстань</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Паливо</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Фрахт</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Зарплата</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Car className="text-gray-400 mr-2" size={16} />
                            {trip.carNumber}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <MapPin className="text-gray-400 mr-1" size={14} />
                            {trip.route}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="text-gray-400 mr-1" size={14} />
                            {trip.startDate} - {trip.endDate}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {trip.distance} км
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Fuel className="text-yellow-500 mr-1" size={14} />
                            {trip.fuelAmount} л ({(trip.fuelAmount * (trip.fuelPricePerLiter || 50)).toFixed(0)} грн)
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <DollarSign className="text-green-500 mr-1" size={14} />
                            {trip.freightSum} грн
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-green-600">
                          {trip.driverSalary.toFixed(2)} грн
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(trip)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trips.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Немає рейсів. Додайте перший рейс щоб почати.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'cars' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Car className="text-blue-600" />
                Статистика по авто
              </h2>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Авто
                  </label>
                  <select
                    value={selectedCar}
                    onChange={(e) => setSelectedCar(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Всі авто</option>
                    {uniqueCars.map(car => (
                      <option key={car} value={car}>{car}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Період з
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Період до
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCar('');
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Скинути
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Загальна статистика всіх авто */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Загальна статистика всіх авто</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {uniqueCars.map(carNumber => {
                    const carStats = getCarStatistics(carNumber);
                    return (
                      <div key={carNumber} className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Car size={16} />
                          {carNumber}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Рейсів:</span>
                            <span className="font-medium">{carStats.trips}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Відстань:</span>
                            <span className="font-medium">{carStats.distance.toLocaleString()} км</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Фрахт:</span>
                            <span className="font-medium text-green-600">{carStats.freight.toLocaleString()} грн</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Паливо:</span>
                            <span className="font-medium">{carStats.fuel} л</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Вартість палива:</span>
                            <span className="font-medium text-yellow-600">{carStats.fuelCost.toLocaleString()} грн</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Суточні:</span>
                            <span className="font-medium">{carStats.dailyAllowances} грн</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Зарплати:</span>
                            <span className="font-medium">{carStats.driverSalaries.toFixed(0)} грн</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ремонт:</span>
                            <span className="font-medium text-red-600">{carStats.repairExpenses} грн</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Непередбачувані:</span>
                            <span className="font-medium">{carStats.unexpectedExpenses} грн</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Ціна/км:</span>
                            <span className="font-bold text-blue-600">{carStats.pricePerKm.toFixed(2)} грн/км</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-gray-600 font-medium">Чистий прибуток:</span>
                            <span className={`font-bold ${carStats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {carStats.netProfit.toLocaleString()} грн
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Відфільтрована статистика */}
              {(selectedCar || (dateFrom && dateTo)) && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Статистика за вибраний період
                      {selectedCar && ` - ${selectedCar}`}
                      {dateFrom && dateTo && ` (${dateFrom} - ${dateTo})`}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {(() => {
                        const filteredStats = getFilteredStatistics();
                        return (
                          <>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-blue-600">Рейсів</p>
                                  <p className="text-2xl font-bold text-blue-900">{filteredStats.totalTrips}</p>
                                </div>
                                <Car className="text-blue-600" size={24} />
                              </div>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-green-600">Відстань</p>
                                  <p className="text-2xl font-bold text-green-900">{filteredStats.totalDistance.toLocaleString()} км</p>
                                </div>
                                <MapPin className="text-green-600" size={24} />
                              </div>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-purple-600">Фрахт</p>
                                  <p className="text-2xl font-bold text-purple-900">{filteredStats.totalFreight.toLocaleString()} грн</p>
                                </div>
                                <DollarSign className="text-purple-600" size={24} />
                              </div>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${filteredStats.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-sm font-medium ${filteredStats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    Чистий прибуток
                                  </p>
                                  <p className={`text-2xl font-bold ${filteredStats.netProfit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                                    {filteredStats.netProfit.toLocaleString()} грн
                                  </p>
                                </div>
                                <BarChart3 className={filteredStats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} size={24} />
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Детальна розбивка витрат */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Детальна розбивка</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {(() => {
                          const filteredStats = getFilteredStatistics();
                          return (
                            <>
                              <div>
                                <span className="text-gray-600">Фрахт:</span>
                                <span className="font-medium text-green-600 ml-2">{filteredStats.totalFreight.toLocaleString()} грн</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Паливо:</span>
                                <span className="font-medium text-red-600 ml-2">-{filteredStats.totalFuelCost.toLocaleString()} грн</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Суточні:</span>
                                <span className="font-medium text-red-600 ml-2">-{filteredStats.totalDailyAllowances.toLocaleString()} грн</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Зарплати:</span>
                                <span className="font-medium text-red-600 ml-2">-{filteredStats.totalDriverSalaries.toFixed(0).toLocaleString()} грн</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Ремонт:</span>
                                <span className="font-medium text-red-600 ml-2">-{filteredStats.totalRepairExpenses.toLocaleString()} грн</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Непередбачувані:</span>
                                <span className="font-medium text-red-600 ml-2">-{filteredStats.totalUnexpectedExpenses.toLocaleString()} грн</span>
                              </div>
                              <div className="border-t pt-2 col-span-2">
                                <span className="text-gray-900 font-medium">Чистий прибуток:</span>
                                <span className={`font-bold ml-2 ${filteredStats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {filteredStats.netProfit.toLocaleString()} грн
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Таблиця відфільтрованих рейсів */}
                    <div className="overflow-x-auto">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Деталі рейсів</h4>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Дата</th>
                            <th className="px-4 py-2 text-left">Авто</th>
                            <th className="px-4 py-2 text-left">Маршрут</th>
                            <th className="px-4 py-2 text-right">Паливо</th>
                          <th className="px-4 py-2 text-right">Вартість палива</th>
                            <th className="px-4 py-2 text-right">Вартість палива</th>
                            <th className="px-4 py-2 text-right">Відстань</th>
                            <th className="px-4 py-2 text-right">Фрахт</th>
                            <th className="px-4 py-2 text-right">Ціна/км</th>
                            <th className="px-4 py-2 text-right">Зарплата</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {getFilteredTrips().map((trip) => (
                            <tr key={trip.id}>
                              <td className="px-4 py-2">{trip.startDate}</td>
                              <td className="px-4 py-2">{trip.carNumber}</td>
                              <td className="px-4 py-2">{trip.route}</td>
                              <td className="px-4 py-2 text-right">{trip.distance} км</td>
                              <td className="px-4 py-2 text-right">{trip.fuelAmount} л</td>
                            <td className="px-4 py-2 text-right text-yellow-600">{(trip.fuelAmount * (trip.fuelPricePerLiter || 50)).toFixed(2)} грн</td>
                              <td className="px-4 py-2 text-right text-yellow-600">{(trip.fuelAmount * fuelPricePerLiter).toFixed(2)} грн</td>
                              <td className="px-4 py-2 text-right">{trip.freightSum} грн</td>
                              <td className="px-4 py-2 text-right font-medium text-blue-600">
                                {trip.distance > 0 ? (trip.freightSum / trip.distance).toFixed(2) : 0} грн/км
                              </td>
                              <td className="px-4 py-2 text-right font-medium text-green-600">
                                {trip.driverSalary.toFixed(2)} грн
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {getFilteredTrips().length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          Немає рейсів за вибраними критеріями
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-blue-600" />
                Статистика
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Всього рейсів</p>
                      <p className="text-2xl font-bold text-blue-900">{statistics.totalTrips}</p>
                    </div>
                    <Car className="text-blue-600" size={24} />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Загальна відстань</p>
                      <p className="text-2xl font-bold text-green-900">{statistics.totalDistance.toLocaleString()} км</p>
                    </div>
                    <MapPin className="text-green-600" size={24} />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Витрачено палива</p>
                      <p className="text-2xl font-bold text-yellow-900">{statistics.totalFuel} л</p>
                      <p className="text-sm text-yellow-700">{statistics.totalFuelCost.toLocaleString()} грн</p>
                    </div>
                    <Fuel className="text-yellow-600" size={24} />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Загальний фрахт</p>
                      <p className="text-2xl font-bold text-purple-900">{statistics.totalFreight.toLocaleString()} грн</p>
                    </div>
                    <DollarSign className="text-purple-600" size={24} />
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">Зарплати водіїв</p>
                      <p className="text-2xl font-bold text-indigo-900">{statistics.totalDriverSalaries.toFixed(0).toLocaleString()} грн</p>
                    </div>
                    <DollarSign className="text-indigo-600" size={24} />
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Ціна за км</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {statistics.totalDistance > 0 ? 
                          (statistics.totalFreight / statistics.totalDistance).toFixed(2) : 0} грн/км
                      </p>
                    </div>
                    <MapPin className="text-orange-600" size={24} />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Витрати на ремонт</p>
                      <p className="text-2xl font-bold text-red-900">{statistics.totalRepairExpenses.toLocaleString()} грн</p>
                    </div>
                    <Wrench className="text-red-600" size={24} />
                  </div>
                </div>
              </div>

              {trips.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Детальна розбивка доходів і витрат</h3>
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{statistics.totalFreight.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Загальний фрахт</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">-{(statistics.totalFuelCost + statistics.totalDailyAllowances + statistics.totalDriverSalaries + statistics.totalRepairExpenses + statistics.totalUnexpectedExpenses).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Загальні витрати</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${statistics.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {statistics.netProfit.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Чистий прибуток</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${statistics.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {statistics.totalFreight > 0 ? ((statistics.netProfit / statistics.totalFreight) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-sm text-gray-600">Рентабельність</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Паливо:</span>
                        <span className="font-medium text-red-600">-{statistics.totalFuelCost.toLocaleString()} грн</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Суточні:</span>
                        <span className="font-medium text-red-600">-{statistics.totalDailyAllowances.toLocaleString()} грн</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Зарплати:</span>
                        <span className="font-medium text-red-600">-{statistics.totalDriverSalaries.toFixed(0).toLocaleString()} грн</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ремонт:</span>
                        <span className="font-medium text-red-600">-{statistics.totalRepairExpenses.toLocaleString()} грн</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Непередбачувані:</span>
                        <span className="font-medium text-red-600">-{statistics.totalUnexpectedExpenses.toLocaleString()} грн</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-4">Деталі по рейсах</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Авто</th>
                          <th className="px-4 py-2 text-left">Маршрут</th>
                          <th className="px-4 py-2 text-right">Відстань</th>
                          <th className="px-4 py-2 text-right">Паливо</th>
                          <th className="px-4 py-2 text-right">Суточні</th>
                          <th className="px-4 py-2 text-right">Фрахт</th>
                          <th className="px-4 py-2 text-right">Зарплата</th>
                          <th className="px-4 py-2 text-right">Ціна/км</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {trips.map((trip) => (
                          <tr key={trip.id}>
                            <td className="px-4 py-2">{trip.carNumber}</td>
                            <td className="px-4 py-2">{trip.route}</td>
                            <td className="px-4 py-2 text-right">{trip.distance} км</td>
                            <td className="px-4 py-2 text-right">{trip.fuelAmount} л</td>
                            <td className="px-4 py-2 text-right">{trip.dailyAllowance} грн</td>
                            <td className="px-4 py-2 text-right">{trip.freightSum} грн</td>
                            <td className="px-4 py-2 text-right font-medium text-green-600">
                              {trip.driverSalary.toFixed(2)} грн
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-blue-600">
                              {trip.distance > 0 ? (trip.freightSum / trip.distance).toFixed(2) : 0} грн/км
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CargoTransportCRM;
