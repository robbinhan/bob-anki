// import * as Bob from '@bob-plug/core';
// import { translate } from './main';

/**
 * 查找笔记
 * @param text 
 * @returns 
 */
async function findNote(text: string) {
    const note = await $http.request({
        method: 'POST',
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

    $log.info("note resp");
    $log.info(JSON.stringify(note));
    if (note.error) {
        $log.info("has error");
        throw new Error("Anki 查询失败");
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
    return await $http.request({
        method: 'POST',
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
