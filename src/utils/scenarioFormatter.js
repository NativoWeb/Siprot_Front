// utils/scenarioFormatter.js
export function formatScenarioData(scenariosResponse) {
  const formatted = [];

  Object.values(scenariosResponse).forEach((scenario) => {
    const { scenario_type, color, data } = scenario;

    // Asegurar que los datos estén ordenados por año
    const sortedData = [...data].sort((a, b) => a.year - b.year);

    // Extraer indicadores dinámicamente
    if (sortedData.length > 0) {
      const indicators = Object.keys(sortedData[0].values);

      indicators.forEach((indicator) => {
        formatted.push({
          name: `${scenario_type.toUpperCase()} - ${indicator}`,
          type: scenario_type,
          indicator,
          color,
          values: sortedData.map((point) => ({
            year: point.year,
            value: point.values[indicator] ?? null, // Mantener nulos
          })),
        });
      });
    }
  });

  return formatted;
}
