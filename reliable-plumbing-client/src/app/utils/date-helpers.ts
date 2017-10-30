export function convertFromBootstrapDate(dateObj, time = null) {
    if (time == null)
        time = '00:00:00';

    let date = new Date(dateObj.year, dateObj.month - 1, dateObj.day, time.hour, time.minute, 0);

    return date;
}


export function convertTimeTo12(hour, minute) {
    if (hour == 0 || hour == 24)
        return { hour: 12, minute: minute, amPm: 1 };
    else if (hour < 12)
        return { hour: hour, minute: minute, amPm: 1 };
    else if (hour == 12)
        return { hour: 12, minute: minute, amPm: 2 };
    else
        return { hour: hour - 12, minute: minute, amPm: 2 };

}

export function convertTimeTo12String(h, min) {
    let time12 = convertTimeTo12(h, min);

    return convertTimeToString(time12.hour, time12.minute, time12.amPm);
}

export function convertTimeTo24(h, min, amPm) {
    if (h == 12 && amPm == 1)
        h = 0;
    else if (amPm == 2)
        h += 12;

    return { h: h, min: min };
}

export function convertTimeToString(h, min, amPm) {
    let hStr = h < 10 ? '0' + h : h.toString();
    let minStr = min < 10 ? '0' + min : min.toString();
    let amPmStr = amPm == 1 ? 'AM' : 'PM';

    return hStr + ':' + minStr + ' ' + amPmStr
}

export function getTimeArray(span, from, to) {
    let timeSpanFloat = span / 60;
    let timeSpan = { hour: timeSpanFloat - timeSpanFloat % 1, minute: timeSpanFloat % 1 * 60 }

    let firstTimeConvertedTo12 = convertTimeTo12(from.hour, from.minute);
    let timeArr = [{
        id: 1,
        hour: from.hour, minute: from.minute,
        timeStr: convertTimeToString(firstTimeConvertedTo12.hour, firstTimeConvertedTo12.minute, firstTimeConvertedTo12.amPm)
    }];

    let currentTimeFloat = from.hour + from.minute / 60;

    while ((to.hour != 0 && currentTimeFloat < to.hour) || currentTimeFloat < 24) {
        let lastTime = timeArr[timeArr.length - 1];

        currentTimeFloat = (lastTime.hour + lastTime.minute / 60) + timeSpanFloat;

        let currentTime = {
            hour: currentTimeFloat - currentTimeFloat % 1,
            minute: parseInt((currentTimeFloat % 1 * 60).toFixed())
        };
        let convertedTo12 = convertTimeTo12(currentTime.hour, currentTime.minute);
        timeArr.push({
            id: lastTime.id + 1,
            hour: currentTime.hour, minute: currentTime.minute,
            timeStr: convertTimeToString(convertedTo12.hour, convertedTo12.minute, convertedTo12.amPm)
        });
    }

    return timeArr;
}

export function getDatesArray(startDate, endDate) {
    var now = startDate.clone(),
        dates = [];

    while (now.isBefore(endDate) || now.isSame(endDate)) {
        dates.push(now.format('MM-DD-YYYY'));
        now.add(1, 'days');
    }
    return dates;
}

export function getDateString(datObj) {
    return datObj.month + '-' + datObj.day + '-' + datObj.year;
}

export function getEnumEntries(yourEnum: any) {
    let enumObjArr = [];
    for (let enumMember in yourEnum) {
        var isValueProperty = parseInt(enumMember, 10) >= 0
        if (isValueProperty)
            enumObjArr.push({
                id: enumMember,
                text: yourEnum[enumMember]
            });
    }
    return enumObjArr;
}