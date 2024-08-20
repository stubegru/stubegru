export default class CKEditor {
    id: string;

    constructor(id: string, options = {}) {
        this.id = id;
        //@ts-expect-error
        CKEDITOR.replace(id, options);
        //@ts-expect-error
        CKEDITOR.disableAutoInline = true;
    }

    setData(text: string) {
        //@ts-expect-error
        CKEDITOR.instances[this.id].setData(text);
    }

    getData(): string {
        //@ts-expect-error
        return CKEDITOR.instances[this.id].getData();
    }
}