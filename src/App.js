import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './App.css'; // Import the stylesheet

// --- Data ---
const universityData = [
  { name: 'Algoma University', ftUndergrad: 5700, ftGrad: 70, ptUndergrad: 480 },
  { name: 'Brescia University College', ftUndergrad: 1500, ftGrad: 0, ptUndergrad: 100 },
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
    barChartSubtitle: 'Click a bar to see details',
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
    barChartSubtitle: 'Cliquez sur une barre pour voir les détails',
  }
};

// --- Helper Functions & Constants ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
const formatNumber = (num) => num.toLocaleString('en-US');

// --- Reusable UI Components ---
const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

const LanguageToggleButton = ({ language, setLanguage, t }) => (
    <button
        onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
        className="language-toggle-button"
    >
        {t.languageToggle}
    </button>
);

// --- Chart Components ---
const CustomTooltip = ({ active, payload, label, t }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">{`${t.enrolment}: ${formatNumber(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const UniversityBarChart = ({ data, onBarClick, selectedUniversity, t }) => {
    const chartData = data.map(uni => ({ name: uni.name, [t.ftUndergrad]: uni.ftUndergrad }));

    return (
        <Card>
            <h2 className="chart-title">{t.barChartTitle}</h2>
            <p className="chart-subtitle">{t.barChartSubtitle}</p>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" tickFormatter={formatNumber} />
                        <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                        <Bar dataKey={t.ftUndergrad} onClick={onBarClick} radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} className={entry.name === selectedUniversity ? 'bar-active' : 'bar-inactive'} />
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

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="doughnut-label">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (!university) return null;

    return (
        <Card>
            <h2 className="chart-title truncate">{t.doughnutChartTitle} {university.name}</h2>
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
    <div className="dashboard-container">
      <div className="container">
        <header className="header">
          <div>
            <h1 className="header-title">{t.dashboardTitle}</h1>
            <p className="header-subtitle">{t.dashboardSubtitle}</p>
          </div>
          <LanguageToggleButton language={language} setLanguage={setLanguage} t={t} />
        </header>

        <main className="main-grid">
          <div className="bar-chart-section">
            <UniversityBarChart
                data={universityData}
                onBarClick={handleBarClick}
                selectedUniversity={selectedUniversity}
                t={t}
            />
          </div>
          <div className="doughnut-chart-section">
            <EnrolmentDoughnutChart
                university={selectedUniversityData}
                t={t}
            />
          </div>
        </main>

        <footer className="footer">
            <p>SEG3125 - Assignment 5 - Interactive Dashboard</p>
        </footer>
      </div>
    </div>
  );
}
