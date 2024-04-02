export default class ClassicEditor {
    static create(sourceElementOrData: HTMLElement | string, config?: Object): Promise<ClassicEditor>;

    getData():string;
    setData(data:string);
}

