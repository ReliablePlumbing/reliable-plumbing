import { Service } from 'typedi'
import config from '../../config';
import * as fs from 'fs';
import * as uuid from 'uuid';
// import * as sharp from 'sharp';
import * as path from 'path';
@Service()
export class FilesManager {

    getImagesFilesNames(files) {
        if (!files || files.length == 0)
            return [];
        return files.map(img => img.filename);
    }

    moveFilesToObjectFolder(objectId, files) {
        if (!files || files.length == 0)
            return;

        let objectPath = config.filesSettings.basePath + '/' + objectId;
        if (!fs.existsSync(objectPath))
            fs.mkdirSync(objectPath);

        for (let file of files) {
            let oldPath = file.path;
            let newPath = objectPath + '/' + file.filename;

            // sharp(oldPath)
            //     .resize(config.filesSettings.imageMaxWidth, config.filesSettings.imageMaxHeight)
            //     .withoutEnlargement(true)
            //     .background('#ffffff00')
            //     .embed()
            //     .toFile(newPath)
            //     .then((a) => {
            //         this.createThumbnail(oldPath, file.filename, objectPath);
            //     });

        }
    }

    createThumbnail(oldPath: string, fileName, objectPath) {
        let indexOfFormat = fileName.lastIndexOf('.');
        let format = fileName.substring(indexOfFormat, oldPath.length);
        let fileNameWithoutExt = fileName.substring(0, indexOfFormat);

        let thmbnailName = fileNameWithoutExt + config.filesSettings.thumbnailExtension + format;
        let thmbnailNewPath = objectPath + '/' + thmbnailName;
        // sharp(oldPath)
        //     .resize(config.filesSettings.thumbnailWidth, config.filesSettings.thumbnailHeight)
        //     .withoutEnlargement(true)
        //     .background('#ffffff00')
        //     .embed()
        //     .toFile(thmbnailNewPath)
        //     .then((a) => {

        //         sharp.cache(false);
        //         fs.unlink(oldPath, err => {
        //             if (err)
        //                 console.log(err);
        //         })
        //     });
    }

    getFilesUrls(filesDic) {
        let urls = [];
        let basePath = config.filesSettings.basePath;

        for (let objectId in filesDic) {
            for (let fileName of filesDic[objectId])
                urls.push(basePath + '/' + objectId + '/' + fileName);
        }
        return urls;
    }

}