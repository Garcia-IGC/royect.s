import React from 'react';

interface UsageGuideProps {
  enEdicion: boolean;
}

const UsageGuide: React.FC<UsageGuideProps> = ({ enEdicion }) => {
  if (!enEdicion) return null;

  const guideItems = [
    { icon: '✓', text: 'Solo los ramos <strong>NO CURSADOS</strong> son arrastrables' },
    { icon: '✓', text: 'Borde <strong className="text-green-600">verde</strong>: Ramo aprobado' },
    { icon: '✓', text: 'Borde <strong className="text-sky-600">azul</strong>: Ramo inscrito' },
    { icon: '✓', text: 'Borde <strong className="text-purple-600">morado</strong>: Inscrito en simulación (permite mover dependientes)' },
    { icon: '✓', text: 'Borde <strong className="text-teal-600">teal</strong>: Cumple prerequisitos' },
    { icon: '⚠', text: 'Borde <strong className="text-orange-600">naranja</strong>: Falta prerequisitos' },
    { icon: '📍', text: 'Badge <strong>Movido</strong>: Ramo reubicado de su semestre original' },
    { icon: '🎓', text: '<strong>Simular Inscripción</strong>: Previsualiza tu plan reorganizado' },
    { icon: '💡', text: 'Puedes mover ramos <strong>hacia adelante o atrás</strong> en los semestres' },
    { icon: '⚠️', text: '<strong className="text-red-600">Máximo 30 SCT</strong> por semestre (límite reglamentario)' },
    { icon: '📊', text: 'El contador muestra solo créditos <strong>inscritos</strong> o <strong>marcados para inscripción</strong>' },
    { icon: '🔶', text: 'Encabezado <strong className="text-orange-600">naranja</strong>: 25-30 SCT inscritos (casi en el límite)' },
    { icon: '🔴', text: 'Encabezado <strong className="text-red-600">rojo</strong>: &gt;30 SCT inscritos (excede el límite)' },
    { icon: '○', text: 'Click en <strong>"Simular inscripción"</strong> dentro de un ramo para marcarlo como inscrito temporalmente' },
  ];

  return (
    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-4">
      <p className="text-sm font-bold text-indigo-800 mb-3">💡 Guía de uso:</p>
      <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-700">
        {guideItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className={item.icon === '✓' ? 'text-indigo-600' : item.icon === '⚠' ? 'text-orange-600' : 'text-gray-600'}>
              {item.icon}
            </span>
            <span dangerouslySetInnerHTML={{ __html: item.text }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageGuide;
