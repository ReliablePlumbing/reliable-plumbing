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

export function convertTimeToString(h, min, amPm) {
    let hStr = h < 10 ? '0' + h : h.toString();
    let minStr = min < 10 ? '0' + min : min.toString();
    let amPmStr = amPm == 1 ? 'am' : 'pm';

    return hStr + ':' + minStr + ' ' + amPmStr
}

export function getTimeArray(span, from, to) {
    let timeSpanFloat = span / 60;
    let timeSpan = { h: timeSpanFloat - timeSpanFloat % 1, min: timeSpanFloat % 1 * 60 }

    let firstTimeConvertedTo12 = convertTimeTo12(from.h, from.min);
    let timeArr = [{
        id: 1,
        h: from.h, min: from.min,
        timeStr: convertTimeToString(firstTimeConvertedTo12.h, firstTimeConvertedTo12.min, firstTimeConvertedTo12.amPm)
    }];

    let currentTimeFloat = from.h + from.min / 60;

    while ((to.h != 0 && currentTimeFloat < to.h) || currentTimeFloat < 24) {
        let lastTime = timeArr[timeArr.length - 1];

        currentTimeFloat = (lastTime.h + lastTime.min / 60) + timeSpanFloat;

        let currentTime = {
            h: currentTimeFloat - currentTimeFloat % 1,
            min: parseInt((currentTimeFloat % 1 * 60).toFixed())
        };
        let convertedTo12 = convertTimeTo12(currentTime.h, currentTime.min);
        timeArr.push({
            id: lastTime.id + 1,
            h: currentTime.h, min: currentTime.min,
            timeStr: convertTimeToString(convertedTo12.h, convertedTo12.min, convertedTo12.amPm)
        });
    }

    return timeArr;
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