import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

// --- Data ---
// Source: Fall 2024 full-time and part-time fall enrolment at Canadian universities
// As provided in the assignment document.
const universityData = [
  { name: 'Algoma University', ftUndergrad: 5700, ftGrad: 70, ptUndergrad: 480 },
  { name: 'Brescia University College', ftUndergrad: 1500, ftGrad: 0, ptUndergrad: 100 }, // Fictional data for Brescia for demo
  { name: 'Brock University', ftUndergrad: 15600, ftGrad: 1800, ptUndergrad: 1700 },
  { name: 'Carleton University', ftUndergrad: 19600, ftGrad: 3900, ptUndergrad: 5500 },
];

// --- Internationalization (i18n) Content ---
const translations = {
  en: {
    dashboardTitle: 'Canadian University Enrolment Dashboard',
    dashboardSubtitle: 'Fall 2024 Enrolment Data | Source: Association of Atlantic Universities, Council of Ontario Universities, Individual institutions, Bureau de coopération interuniversitaire',
    barChartTitle: 'Full-Time Undergraduate Enrolment',
    doughnutChartTitle: 'Enrolment Breakdown for',
    ftUndergrad: 'FT Undergrad',
    ftGrad: 'FT Grad',
    ptUndergrad: 'PT Undergrad',
    university: 'University',
    enrolment: 'Enrolment',
    languageToggle: 'Français',
  },
  fr: {
    dashboardTitle: 'Tableau de Bord des Inscriptions Universitaires Canadiennes',
    dashboardSubtitle: 'Données d\'inscription pour l\'automne 2024 | Source : Association des universités de l\'Atlantique, Conseil des universités de l\'Ontario, Établissements individuels, Bureau de coopération interuniversitaire',
    barChartTitle: 'Inscriptions de Premier Cycle à Temps Plein',
    doughnutChartTitle: 'Répartition des Inscriptions pour',
    ftUndergrad: '1er cycle TP',
    ftGrad: '2e/3e cycle TP',
    ptUndergrad: '1er cycle TPartiel',
    university: 'Université',
    enrolment: 'Inscriptions',
    languageToggle: 'English',
  }
};

// --- Helper Functions & Constants ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
const formatNumber = (num) => num.toLocaleString('en-US');

// --- Reusable UI Components ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const LanguageToggleButton = ({ language, setLanguage, t }) => (
    <button
        onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
        className="bg-white text-blue-600 font-semibold py-2 px-4 border border-blue-500 rounded-lg shadow-sm hover:bg-blue-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
        {t.languageToggle}
    </button>
);


// --- Chart Components ---

const CustomTooltip = ({ active, payload, label, t }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-blue-600">{`${t.enrolment}: ${formatNumber(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const UniversityBarChart = ({ data, onBarClick, selectedUniversity, t }) => {
    const chartData = data.map(uni => ({ name: uni.name, [t.ftUndergrad]: uni.ftUndergrad }));

    return (
        <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{t.barChartTitle}</h2>
            <p className="text-sm text-gray-500 mb-4">Click a bar to see details</p>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" tickFormatter={formatNumber} />
                        <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                        <Bar dataKey={t.ftUndergrad} onClick={onBarClick} radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === selectedUniversity ? '#2563eb' : '#60a5fa'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const EnrolmentDoughnutChart = ({ university, t }) => {
    const data = useMemo(() => {
        if (!university) return [];
        return [
            { name: t.ftUndergrad, value: university.ftUndergrad },
            { name: t.ftGrad, value: university.ftGrad },
            { name: t.ptUndergrad, value: university.ptUndergrad },
        ].filter(d => d.value > 0);
    }, [university, t]);

    const total = useMemo(() => data.reduce((sum, entry) => sum + entry.value, 0), [data]);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-semibold text-sm">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (!university) return null;

    return (
        <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4 truncate">{t.doughnutChartTitle} {university.name}</h2>
             <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            innerRadius={60}
                            outerRadius={110}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(value)} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};


// --- Main App Component ---

export default function App() {
  const [language, setLanguage] = useState('en');
  const [selectedUniversity, setSelectedUniversity] = useState(universityData[0].name);

  const t = translations[language];

  const handleBarClick = (data) => {
    setSelectedUniversity(data.name);
  };

  const selectedUniversityData = useMemo(() => {
      return universityData.find(uni => uni.name === selectedUniversity);
  }, [selectedUniversity]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700">{t.dashboardTitle}</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">{t.dashboardSubtitle}</p>
          </div>
          <LanguageToggleButton language={language} setLanguage={setLanguage} t={t} />
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Bar Chart Section */}
          <div className="lg:col-span-3">
            <UniversityBarChart 
                data={universityData} 
                onBarClick={handleBarClick}
                selectedUniversity={selectedUniversity}
                t={t}
            />
          </div>

          {/* Doughnut Chart Section */}
          <div className="lg:col-span-2">
            <EnrolmentDoughnutChart 
                university={selectedUniversityData}
                t={t}
            />
          </div>

        </main>
        
        {/* Footer */}
        <footer className="text-center mt-12 text-gray-400 text-sm">
            <p>SEG3125 - Assignment 5 - Interactive Dashboard</p>
        </footer>
      </div>
    </div>
  );
}
