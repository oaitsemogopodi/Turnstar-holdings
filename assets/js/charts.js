const chartInstances = {};
const entityColors = { botswana: '#1676C5', tanzania: '#17365D', uae: '#76AEDD' };
const darkEntityColors = { botswana: '#69B8F5', tanzania: '#9AB8E1', uae: '#4793CE' };
const getEntityColor = id =>
  (document.documentElement.getAttribute('data-bs-theme') === 'dark'
    ? darkEntityColors : entityColors)[id];

function chartThemeColors() {
  const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const fallback = dark
    ? { ink: '#F1F5F9', muted: '#B0BED0', grid: '#334155',
        primary: '#60A5FA', tooltip: '#E2E8F0', tooltipText: '#152133',
        occupied: '#4DB58A', vacant: '#F0B55A' }
    : { ink: '#182230', muted: '#526174', grid: '#E6EBF1',
        primary: '#2563EB', tooltip: '#182230', tooltipText: '#F8FAFC',
        occupied: '#315E4D', vacant: '#B7791F' };
  if (typeof getComputedStyle !== 'function') return fallback;
  const style = getComputedStyle(document.documentElement);
  const token = (name, value) => style.getPropertyValue(name).trim() || value;
  return {
    ink: token('--ink', fallback.ink),
    muted: token('--muted', fallback.muted),
    grid: token('--chart-grid', fallback.grid),
    primary: token('--primary', fallback.primary),
    tooltip: token('--tooltip-bg', fallback.tooltip),
    tooltipText: token('--tooltip-text', fallback.tooltipText),
    occupied: token('--occupied-chart', fallback.occupied),
    vacant: token('--vacant-chart', fallback.vacant)
  };
}

function applyChartTheme() {
  const colors = chartThemeColors();
  if (typeof Chart !== 'undefined') Chart.defaults.color = colors.muted;
  Object.values(chartInstances).forEach(chart => {
    chart.options.color = colors.muted;
    const tooltip = chart.options.plugins.tooltip;
    tooltip.backgroundColor = colors.tooltip;
    tooltip.titleColor = colors.tooltipText;
    tooltip.bodyColor = colors.tooltipText;
    Object.values(chart.options.scales || {}).forEach(axis => {
      if (axis.ticks) axis.ticks.color = colors.muted;
      if (axis.grid) axis.grid.color = colors.grid;
    });
    chart.data.datasets.forEach(dataset => {
      if (chart.canvas.id === 'occupancyChart') {
        dataset.backgroundColor = [colors.occupied, colors.vacant];
      } else if (chart.$entityIds) {
        dataset.backgroundColor = chart.$entityIds.map(getEntityColor);
        dataset.hoverBackgroundColor = dataset.backgroundColor;
      }
      dataset.hoverBorderColor = colors.primary;
      if (Array.isArray(dataset.borderColor)) {
        dataset.borderColor = dataset.borderColor.map(color => color === 'transparent' ? color : colors.primary);
      }
    });
    chart.update('none');
  });
}

window.addEventListener('dashboard:themechange', applyChartTheme);

function wrapChartLabel(label, limit = 23) {
  const words = String(label).split(' ');
  const lines = [''];
  words.forEach(word => {
    const last = lines.length - 1;
    if (lines[last] && (lines[last] + ' ' + word).length > limit) lines.push(word);
    else lines[last] += (lines[last] ? ' ' : '') + word;
  });
  return lines;
}

function chartEmptyState(canvas, title, description) {
  let message = canvas.parentElement.querySelector('.chart-empty');
  if (!message) {
    message = document.createElement('div');
    message.className = 'chart-empty';
    message.setAttribute('role', 'status');
    canvas.parentElement.appendChild(message);
  }
  message.hidden = !title;
  canvas.hidden = !!title;
  if (title) {
    message.innerHTML = '<i class="bi bi-bar-chart" aria-hidden="true"></i>' +
      '<strong>' + title + '</strong><span>' + description + '</span>';
  }
}

function drawChart(id, type, labels, values, options = {}) {
  const canvas = document.getElementById(id);
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', labels.map((label, index) =>
    label + ': ' + (options.currency ? money(values[index]) : values[index] + ' units')
  ).join('; '));

  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
  if (options.emptyTitle) {
    chartEmptyState(canvas, options.emptyTitle, options.emptyDescription);
    return;
  }
  if (typeof Chart === 'undefined') {
    chartEmptyState(canvas, 'Chart unavailable',
      'The chart library could not load. Portfolio figures remain available in the schedule.');
    return;
  }
  chartEmptyState(canvas, '', '');
  Chart.defaults.font.family = 'Montserrat, Segoe UI, sans-serif';
  Chart.defaults.font.size = 12;
  const theme = chartThemeColors();
  Chart.defaults.color = theme.muted;

  const horizontal = !!options.horizontal;
  const categoryAxis = {
    type: 'category',
    offset: true,
    grid: { display: false, color: theme.grid },
    border: { display: false },
    ticks: {
      autoSkip: !horizontal,
      maxRotation: 0,
      minRotation: 0,
      padding: 10,
      color: theme.muted,
      callback: function(value) {
        const label = this.getLabelForValue(value);
        return horizontal ? wrapChartLabel(label) : label;
      }
    }
  };
  const valueAxis = {
    type: 'linear',
    beginAtZero: true,
    border: { display: false },
    grid: { color: theme.grid, drawTicks: false },
    ticks: {
      precision: 0,
      color: theme.muted,
      padding: 8,
      callback: value => options.currency
        ? 'P ' + (value >= 1e9 ? Number((value / 1e9).toFixed(2)) + 'bn' : value >= 1e6 ? Number((value / 1e6).toFixed(1)) + 'm' : value >= 1000 ? Number((value / 1000).toFixed(1)) + 'k' : value)
        : value
    }
  };
  chartInstances[id] = new Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: options.colors || '#1676C5',
        borderWidth: options.selectedIndex == null ? 0 : values.map((_, index) => index === options.selectedIndex ? 2 : 0),
        borderColor: values.map((_, index) => index === options.selectedIndex ? theme.primary : 'transparent'),
        hoverBorderWidth: 3,
        hoverBorderColor: theme.primary,
        borderRadius: type === 'bar' ? 5 : 0,
        maxBarThickness: horizontal ? 22 : 48,
        barPercentage: .7,
        categoryPercentage: .75,
        hoverBackgroundColor: options.colors || '#1676C5'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      indexAxis: horizontal ? 'y' : 'x',
      ...(type === 'doughnut'
        ? { cutout: '78%' }
        : { scales: horizontal
          ? { x: valueAxis, y: categoryAxis }
          : { x: categoryAxis, y: valueAxis } }),
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltip,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: contexts => labels[contexts[0].dataIndex],
            label: context => options.currency ? money(context.raw) : context.raw + ' units'
          }
        }
      },
      onClick: (event, elements) => {
        if (elements.length && options.onSelect) options.onSelect(elements[0].index);
      },
      onHover: (event, elements) => {
        if (event.native?.target) {
          event.native.target.style.cursor = elements.length && options.onSelect ? 'pointer' : 'default';
        }
      }
    }
  });
  chartInstances[id].$entityIds = options.entityIds || null;
}

function updateCharts(records, metrics) {
  const noUnits = records.length === 0;
  const description = noUnits
    ? 'Clear a filter or broaden the selected portfolio.'
    : 'Based on the selected portfolio and reference date.';
  const empty = title => ({
    emptyTitle: noUnits ? 'No units match the active filters.' : title,
    emptyDescription: description
  });
  const scopedEntities = entities.filter(entity => !state.entityId || entity.id === state.entityId);
  const scopedProperties = properties.filter(property =>
    (!state.entityId || property.entityId === state.entityId) &&
    (!state.propertyId || property.id === state.propertyId)
  );
  const entityRent = groupedRent(records, scopedEntities, 'entityId');
  const propertyRent = groupedRent(records, scopedProperties, 'propertyId');
  drawChart('entityChart', 'bar', scopedEntities.map(entity => entity.name), entityRent, {
    currency: true,
    colors: scopedEntities.map(entity => getEntityColor(entity.id)),
    entityIds: scopedEntities.map(entity => entity.id),
    onSelect: index => selectEntity(scopedEntities[index].id),
    selectedIndex: scopedEntities.findIndex(entity => entity.id === state.entityId),
    ...(metrics.rent === 0 ? empty('No occupied rental income in this selection.') : {})
  });
  const propertyCanvas = document.getElementById('propertyChart');
  propertyCanvas.parentElement.style.height = state.unitId
    ? '200px' : Math.max(250, scopedProperties.length * 43) + 'px';
  drawChart('propertyChart', 'bar', scopedProperties.map(property => property.name), propertyRent, {
    currency: true,
    horizontal: true,
    colors: scopedProperties.map(property => getEntityColor(property.entityId)),
    entityIds: scopedProperties.map(property => property.entityId),
    onSelect: index => selectProperty(scopedProperties[index].id),
    selectedIndex: scopedProperties.findIndex(property => property.id === state.propertyId),
    ...(metrics.rent === 0 ? empty('No occupied rental income in this selection.') : {})
  });
  document.getElementById('entitySummary').textContent = scopedEntities.map((entity, index) =>
    entity.name + ': ' + money(entityRent[index])
  ).join('; ');
  document.getElementById('propertySummary').textContent = scopedProperties.map((property, index) =>
    property.name + ': ' + money(propertyRent[index])
  ).join('; ');

  drawChart('occupancyChart', 'doughnut', ['Occupied', 'Vacant'],
    [metrics.occupied, metrics.vacant], {
      colors: [chartThemeColors().occupied, chartThemeColors().vacant],
      ...(noUnits ? empty('No matching units.') : {})
    });
  document.getElementById('unitCount').textContent = records.length + ' UNITS';
  document.getElementById('occupancyCenter').hidden = noUnits || typeof Chart === 'undefined';
  document.getElementById('occupancyCenter').innerHTML =
    (metrics.occupancy === null ? '—' : Math.round(metrics.occupancy * 100) + '%') +
    '<small>occupancy rate</small>';
  document.getElementById('occupancyLegend').innerHTML =
    '<div class="legend-row"><i class="swatch occupied-swatch" aria-hidden="true"></i>' +
    'Occupied<strong>' + metrics.occupied + '</strong></div>' +
    '<div class="legend-row"><i class="swatch vacant-swatch" aria-hidden="true"></i>' +
    'Vacant<strong>' + metrics.vacant + '</strong></div>';

  const buckets = [
    records.filter(unit => inPeriod(unit.leaseExpiry, 3)).length,
    records.filter(unit => inPeriod(unit.leaseExpiry, 6) && !inPeriod(unit.leaseExpiry, 3)).length,
    records.filter(unit => inPeriod(unit.leaseExpiry, 12) && !inPeriod(unit.leaseExpiry, 6)).length
  ];
  drawChart('leaseChart', 'bar', ['Within 3 months', 'Over 3–6 months', 'Over 6–12 months'], buckets, {
    colors: ['#ad9b74', '#1676C5', '#b7c7aa'],
    ...(buckets.every(count => count === 0) ? empty('No leases expire within the next 12 months.') : {})
  });
  document.getElementById('leaseSummary').textContent =
    buckets[0] + ' within 3 months · ' + buckets[1] + ' over 3–6 months · ' +
    buckets[2] + ' over 6–12 months';

  const upcoming = records.filter(unit => inPeriod(unit.nextEscalationDate, 12))
    .sort((a, b) => a.nextEscalationDate.localeCompare(b.nextEscalationDate));
  const months = Array.from({ length: 13 }, (_, index) =>
    addMonths(REFERENCE_DATE.slice(0, 7) + '-01', index).slice(0, 7)
  );
  const monthLabels = months.map(month => new Date(month + '-01T12:00:00Z')
    .toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' }));
  drawChart('escalationChart', 'bar', monthLabels,
    months.map(month => upcoming.filter(unit => unit.nextEscalationDate.startsWith(month)).length), {
      ...(!upcoming.length ? empty('No escalations are due within the next 12 months.') : {})
    });
  document.getElementById('escalationDetail').innerHTML = upcoming.length
    ? upcoming.map(unit => '<div class="schedule-item"><button type="button" data-unit="' + unit.id + '">' +
        '<strong>' + escapeHtml(propertyName(unit.propertyId)) + ' · ' + unit.unit + '</strong>' +
        '<span>' + formatDate(unit.nextEscalationDate) + ' · ' + Math.round(unit.escalationRate * 100) +
        '% escalation</span></button></div>').join('')
    : '<p class="chart-caption">No scheduled escalations in the selected period.</p>';
  document.getElementById('escalationDetail').hidden = !upcoming.length;
  document.getElementById('escalationDetail').parentElement.classList.toggle('no-schedule', !upcoming.length);
  document.getElementById('escalationDetail').querySelectorAll('[data-unit]').forEach(button => {
    button.onclick = () => selectUnit(button.dataset.unit);
  });
}
