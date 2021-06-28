import {PathLike, readFile, writeFile} from "fs";

export class AsyncUtils {
    public static readFileAsync(path: PathLike): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            readFile(path, (err, data) => {
                if (err) return reject(err);
                return resolve(data.toString());
            });
        })
    }

    public static writeFileAsync(path: PathLike, data: string): Promise<void> {
        return new Promise<void>(resolve => {
            writeFile(path, data, () => resolve());
        })
    }
}