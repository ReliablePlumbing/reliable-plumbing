export function convertFromBootstrapDate(dateObj, time = null) {
    if (time == null)
        time = '00:00:00';

    let date = new Date(dateObj.year, dateObj.month - 1, dateObj.day, time.hour, time.mins, 0);

    return date;
}