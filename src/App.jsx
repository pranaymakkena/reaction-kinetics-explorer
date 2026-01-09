import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Flame, Droplet, Zap } from 'lucide-react';

const App = () => {
  const [temperature, setTemperature] = useState(298);
  const [concentrationA, setConcentrationA] = useState(1.0);
  const [concentrationB, setConcentrationB] = useState(1.0);
  const [catalyst, setCatalyst] = useState(false);
  const [reactionOrder, setReactionOrder] = useState('second');
  
  const A = 1e13;
  const Ea_base = 50000;
  const Ea_catalyst = 30000;
  const R = 8.314;
  
  const calculateRateConstant = (temp, useCatalyst) => {
    const Ea = useCatalyst ? Ea_catalyst : Ea_base;
    return A * Math.exp(-Ea / (R * temp));
  };
  
  const calculateRate = (temp, concA, concB, useCatalyst, order) => {
    const k = calculateRateConstant(temp, useCatalyst);
    if (order === 'first') {
      return k * concA;
    } else {
      return k * concA * concB;
    }
  };
  
  const generateTempData = () => {
    const data = [];
    for (let t = 273; t <= 373; t += 5) {
      const rateNoCatalyst = calculateRate(t, concentrationA, concentrationB, false, reactionOrder);
      const rateWithCatalyst = calculateRate(t, concentrationA, concentrationB, true, reactionOrder);
      data.push({
        temp: t - 273,
        noCatalyst: rateNoCatalyst,
        withCatalyst: rateWithCatalyst
      });
    }
    return data;
  };
  
  const generateConcData = () => {
    const data = [];
    for (let c = 0.1; c <= 3.0; c += 0.1) {
      const rate = calculateRate(temperature, c, concentrationB, catalyst, reactionOrder);
      data.push({
        concentration: c.toFixed(1),
        rate: rate
      });
    }
    return data;
  };
  
  const generateArrheniusData = () => {
    const data = [];
    for (let t = 273; t <= 373; t += 10) {
      const k_no = calculateRateConstant(t, false);
      const k_yes = calculateRateConstant(t, true);
      data.push({
        invT: (1000 / t).toFixed(3),
        lnk_no: Math.log(k_no),
        lnk_yes: Math.log(k_yes)
      });
    }
    return data;
  };
  
  const [tempData, setTempData] = useState(generateTempData());
  const [concData, setConcData] = useState(generateConcData());
  const [arrheniusData, setArrheniusData] = useState(generateArrheniusData());
  
  useEffect(() => {
    setTempData(generateTempData());
    setConcData(generateConcData());
    setArrheniusData(generateArrheniusData());
  }, [temperature, concentrationA, concentrationB, catalyst, reactionOrder]);
  
  const currentRate = calculateRate(temperature, concentrationA, concentrationB, catalyst, reactionOrder);
  const currentK = calculateRateConstant(temperature, catalyst);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center gap-3">
            <Zap className="text-yellow-500" />
            Reaction Kinetics Explorer
          </h1>
          <p className="text-gray-600 mb-6">
            Explore how temperature, concentration, and catalysts affect reaction rates
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-lg border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="text-orange-600" />
                  <label className="text-lg font-semibold text-gray-800">
                    Temperature: {temperature} K ({(temperature - 273).toFixed(0)}°C)
                  </label>
                </div>
                <input
                  type="range"
                  min="273"
                  max="373"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0°C</span>
                  <span>100°C</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Droplet className="text-blue-600" />
                  <label className="text-lg font-semibold text-gray-800">
                    [A] Concentration: {concentrationA.toFixed(2)} M
                  </label>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={concentrationA}
                  onChange={(e) => setConcentrationA(Number(e.target.value))}
                  className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Droplet className="text-cyan-600" />
                  <label className="text-lg font-semibold text-gray-800">
                    [B] Concentration: {concentrationB.toFixed(2)} M
                  </label>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={concentrationB}
                  onChange={(e) => setConcentrationB(Number(e.target.value))}
                  className="w-full h-3 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border-2 border-purple-200">
                <label className="text-lg font-semibold text-gray-800 mb-3 block">
                  Reaction Order
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="first"
                      checked={reactionOrder === 'first'}
                      onChange={(e) => setReactionOrder(e.target.value)}
                      className="w-5 h-5 accent-purple-600"
                    />
                    <span className="text-gray-700">First Order (Rate = k[A])</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="second"
                      checked={reactionOrder === 'second'}
                      onChange={(e) => setReactionOrder(e.target.value)}
                      className="w-5 h-5 accent-purple-600"
                    />
                    <span className="text-gray-700">Second Order (Rate = k[A][B])</span>
                  </label>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catalyst}
                    onChange={(e) => setCatalyst(e.target.checked)}
                    className="w-6 h-6 accent-green-600 cursor-pointer"
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    Add Catalyst (reduces Ea from 50 to 30 kJ/mol)
                  </span>
                </label>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg border-2 border-indigo-300">
                <h3 className="text-xl font-bold text-indigo-900 mb-3">Current Conditions</h3>
                <div className="space-y-2 text-gray-800">
                  <p><span className="font-semibold">Rate Constant (k):</span> {currentK.toExponential(3)} {reactionOrder === 'first' ? 's⁻¹' : 'M⁻¹s⁻¹'}</p>
                  <p><span className="font-semibold">Reaction Rate:</span> {currentRate.toExponential(3)} M/s</p>
                  <p><span className="font-semibold">Half-life:</span> {reactionOrder === 'first' ? (Math.log(2) / currentK).toFixed(2) + ' s' : 'Depends on [A]₀'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rate vs Temperature</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="temp" label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Rate (M/s)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => value.toExponential(2)} />
                <Legend />
                <Line type="monotone" dataKey="noCatalyst" stroke="#ef4444" strokeWidth={2} name="No Catalyst" dot={false} />
                <Line type="monotone" dataKey="withCatalyst" stroke="#10b981" strokeWidth={2} name="With Catalyst" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rate vs [A] Concentration</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={concData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="concentration" label={{ value: '[A] (M)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Rate (M/s)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => value.toExponential(2)} />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} name="Reaction Rate" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6 md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Arrhenius Plot</h2>
            <p className="text-gray-600 mb-4 text-sm">ln(k) = ln(A) - Eₐ/RT → Linear relationship shows activation energy from slope</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={arrheniusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="invT" label={{ value: '1000/T (K⁻¹)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'ln(k)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="lnk_no" stroke="#f59e0b" strokeWidth={2} name="No Catalyst (Eₐ = 50 kJ/mol)" />
                <Line type="monotone" dataKey="lnk_yes" stroke="#059669" strokeWidth={2} name="With Catalyst (Eₐ = 30 kJ/mol)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Concepts</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-2">Temperature Effect</h3>
              <p className="text-gray-700">Higher temperatures increase molecular kinetic energy, leading to more frequent and energetic collisions. Rate typically doubles for every 10°C increase.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">Concentration Effect</h3>
              <p className="text-gray-700">Higher concentrations increase collision frequency. First-order reactions depend linearly on [A], while second-order depend on [A][B].</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-900 mb-2">Catalyst Effect</h3>
              <p className="text-gray-700">Catalysts lower activation energy by providing an alternative reaction pathway, dramatically increasing rate without being consumed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;