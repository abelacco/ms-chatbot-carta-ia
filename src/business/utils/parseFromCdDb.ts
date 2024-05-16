export function parseHours(hours: any) {
  const parsedHours = [];

  for (let i = 0; i < 7; i++) {
    const fromKey = `from_${i}`;
    const toKey = `to_${i}`;

    if (hours.hasOwnProperty(fromKey) && hours.hasOwnProperty(toKey)) {
      const fromValue = hours[fromKey];
      const toValue = hours[toKey];

      const parsedDay = {
        day: i,
        from: fromValue,
        to: toValue,
      };

      parsedHours.push(parsedDay);
    }
  }

  return parsedHours;
}

export function parseDeliveryArea(area: any) {
  area = area.map((e) => {
    return {
      area: e.name,
      price: e.cost,
    };
  });
  return area;
}
