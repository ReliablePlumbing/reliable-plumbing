export function convertFromBootstrapDate(dateObj, time = null) {
    if (time == null)
        time = '00:00:00';

    let date = new Date(dateObj.year, dateObj.month - 1, dateObj.day, time.hour, time.mins, 0);

    return date;
}


export function convertTimeTo12(h, min) {
    if (h == 0 || h == 24)
        return { h: 12, min: min, amPm: 1 };
    else if (h < 12)
        return { h: h, min: min, amPm: 1 };
    else if (h == 12)
        return { h: 12, min: min, amPm: 2 };
    else
        return { h: h - 12, min: min, amPm: 2 };

}

export function convertTimeTo24(h, min, amPm) {
    if (h == 12 && amPm == 1)
        h = 0;
    else if (amPm == 2)
        h += 12;

    return { h: h, min: min };
}