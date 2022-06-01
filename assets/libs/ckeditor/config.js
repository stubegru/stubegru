/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */
CKEDITOR.editorConfig = function (config) {
    config.toolbarGroups = [
        {
            name: 'document',
            groups: ['mode', 'document', 'doctools']
        },
        {
            name: 'clipboard',
            groups: ['clipboard', 'undo']
        },
        {
            name: 'editing',
            groups: ['editing']
        },
        {
            name: 'links',
            groups: ['links']
        },
        {
            name: 'insert',
            groups: ['insert']
        },
        {
            name: 'basicstyles',
            groups: ['basicstyles', 'cleanup']
        },
        {
            name: 'paragraph',
            groups: ['list', 'indent', 'blocks', 'align']
        },
		'/',
        {
            name: 'styles',
            groups: ['styles']
        },
        {
            name: 'colors',
            groups: ['colors']
        },
        {
            name: 'tools',
            groups: ['tools']
        },
        {
            name: 'others',
            groups: ['others']
        },
        {
            name: 'about',
            groups: ['about']
        }
	];




    config.removeButtons = 'SelectAll,Scayt,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Form,CopyFormatting,BidiLtr,BidiRtl,Language,Flash,Smiley,PageBreak,About,save-to-pdf,NewPage,Templates,Preview,Save,Print,PasteFromWord,Image,Styles,Blockquote,Anchor,HorizontalRule,Iframe,ShowBlocks';


    config.stylesSet = [
        {
            name: 'Allgemein',
            element: 'div',
            attributes: {
                "class": "allgemein"
            }
        }, {
            name: 'Erstinformation',
            element: 'div',
            attributes: {
                "class": "erstinformation"
            }
        },
        {
            name: 'Sachbearbeiter',
            element: 'div',
            attributes: {
                "class": "sachbearbeiter"
            }
        },
        {
            name: 'Key User',
            element: 'div',
            attributes: {
                "class": "keyuser"
            }
        }
    ];

    config.enterMode = CKEDITOR.ENTER_BR; //fügt bei einer neuen Zeile einen <br> ein, anstatt ein neues <p> Element zu erstellen
    config.entities = false; //Umlaute nicht uwmandeln (z.B. in &uuml;), sondern direkt in die Datenbank schreiben (UTF8 kann das :-)
    config.div_wrapTable = true; //Ein <div> in Tabellen immer um die ganze Tabelle generieren
    config.height = 500; //Höhe des Editor-frames 

};
