export default class CKEditor {
    id;
    constructor(id, options = {}) {
        this.id = id;
        //@ts-expect-error
        CKEDITOR.replace(id, options);
        //@ts-expect-error
        CKEDITOR.disableAutoInline = true;
    }
    setData(text) {
        //@ts-expect-error
        CKEDITOR.instances[this.id].setData(text);
    }
    getData() {
        //@ts-expect-error
        return CKEDITOR.instances[this.id].getData();
    }
}
