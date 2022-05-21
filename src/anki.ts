import * as Bob from '@bob-plug/core';
import { translate } from './main';

/**
 * 查找笔记
 * @param text 
 * @returns 
 */
async function findNote(text: string) {
    const note = await Bob.api.$http.post({
        url: 'http://localhost:8765',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            action: 'findNotes',
            version: 6,
            params: {
                "query": "front:" + text
            },
        }
    });

    Bob.api.$log.info("note resp");
    Bob.api.$log.info(JSON.stringify(note));
    if (note.error) {
        Bob.api.$log.info("has error");
        throw new Error(note.error.localizedDescription);
    }

    if (note.data.result.length === 0) {
        return false;
    }

    return true;
}


/**
 * 
 * 保存到anki
 * @param text 
 * @param res 
 * @returns 
 */
async function save(text: string, translateResult: string) {
    return await Bob.api.$http.post({
        url: 'http://localhost:8765',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            action: 'addNote',
            version: 6,
            params: {
                note: {
                    deckName: 'Default',
                    modelName: 'Basic',
                    fields: {
                        Front: text,
                        Back: translateResult,
                    },
                    options: {
                        allowDuplicate: false,
                        duplicateScope: 'deck',
                        duplicateScopeOptions: {
                            deckName: 'Default',
                            checkChildren: false,
                            checkAllModels: false,
                        },
                    },
                    tags: [
                        'bob',
                    ],
                },
            },
        },
    });
}



export { findNote, save };
