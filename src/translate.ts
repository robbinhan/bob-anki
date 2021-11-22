import * as Bob from '@bob-plug/core';

interface QueryOption {
  to?: Bob.Language;
  from?: Bob.Language;
  token?: string;
}


async function findNote(text: string) {
  return await Bob.api.$http.post({
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
}

/**
 * @description 翻译
 * @param {string} text 需要翻译的文字内容
 * @param {object} [options={}]
 * @return {object} 一个符合 bob 识别的翻译结果对象
 */
async function _translate(text: string, options: QueryOption = {}): Promise<Bob.TranslateResult> {
  const { from = 'auto', to = 'auto', token = '3975l6lr5pcbvidl6jl2' } = options;

  const result: Bob.TranslateResult = { from, to, toParagraphs: [] };

  try {
    // 查询是否已经有翻译结果
    const note = await findNote(text);
    Bob.api.$log.info("note resp");
    Bob.api.$log.info(JSON.stringify(note));
    if (note.data.result.length === 0) {
      Bob.api.$http.post({
        url: 'http://api.interpreter.caiyunai.com/v1/translator',
        header: {
          'Content-Type': 'application/json',
          'X-Authorization': `token ${token}`,
        },
        body: {
          source: [text],
          trans_type: 'auto2zh',
          request_id: 'demo',
          detect: true,
        },
        handler: (res) => {
          Bob.api.$log.info(JSON.stringify(res.data));
          Bob.api.$http.post({
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
                    Back: res.data.target[0],
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
        },
      });
    }

    // 在此处实现翻译的具体处理逻辑
    result.toParagraphs = [text];
    result.fromParagraphs = [];
    // result.toDict = { parts: [], phonetics: [] };
  } catch (error) {
    throw Bob.util.error('api', '数据解析错误出错', error);
  }

  return result;
}

export { _translate };
