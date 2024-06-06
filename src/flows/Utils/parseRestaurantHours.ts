import { Days } from 'src/common/enums';

export function parseRestaurantHours(hours: any) {
  hours.map((e) => {
    e.day = Days[e.day];
    return e;
  });
  return hours;
}
