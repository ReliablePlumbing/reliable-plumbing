import { environment } from '../../environments/environment';

export function b64toByteArr(b64DataWithContent) {
    let arr = b64DataWithContent.split(',');
    let contentType = arr[0].substring('data:'.length, arr[0].length - ';base64'.length);

    let b64Data = arr[1];
    let byteCharacters = atob(b64Data);
    let byteNumbers = new Array(byteCharacters.length);

    for (var i = 0; i < byteCharacters.length; i++)
        byteNumbers[i] = byteCharacters.charCodeAt(i);

    return byteNumbers;
}


export function buildFilesUrls(objectId, filesNames: string | string[]) {
    let baseFilesUrl = environment.filesUrl + objectId + '/';

    if (typeof filesNames == 'string')
        return baseFilesUrl + filesNames;
    else {
        let urls = [];

        for (let fileName of filesNames)
            urls.push(baseFilesUrl + filesNames);

        return urls;
    }
}

export function buildImagesObjects(objectId, filesNames: string | string[]) {
    let baseFilesUrl = environment.filesUrl + objectId + '/';

    if (typeof filesNames == 'string')
        return { source: baseFilesUrl + filesNames, alt: '', title: '' };
    else {
        let images = [];

        for (let fileName of filesNames)
            images.push({ source: baseFilesUrl + fileName, alt: '', title: '' });

        return images;
    }
}

export function buildImagesObjectsForLightBox(objectId, filesNames) {
    let baseFilesUrl = environment.filesUrl + objectId + '/';
    let images = [];

    for (let i = 0; i < filesNames.length; i++) {
        let fileName = filesNames[i];
        let url = baseFilesUrl + fileName
        images.push({ source: url, thumbnail: url, index: i });
    }

    return images;
}
