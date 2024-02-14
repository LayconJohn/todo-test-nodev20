import { describe, it, beforeEach } from "node:test"
import TodoService from "../src/todoService.js";
import assert from "node:assert"

describe("Todo Service test Suite", () => {
    describe("#list", () => {
        let _todoService;
        let _dependencies;

        const mockDatabase = [
            {
              text: 'I must plan my trip to Europe',
              when: new Date('2021-03-22T00:00:00.000Z'),
              status: 'late',
              id: 'b1e65485-99b1-4874-88c0-52d7fda42fa8'
            }
        ];

        beforeEach((context) => {
            _dependencies = {
                todoRepository: {
                    list: context.mock.fn(async () => mockDatabase)
                }
            }

            _todoService = new TodoService(_dependencies)
        });

        it('Should reurn a list of a items with uppercase text', async () => {
            const expected = mockDatabase.map(({ text, ...result }) => ({ text: text.toUpperCase(), ...result }));
            const result = await _todoService.list();
            assert.deepStrictEqual(result, expected);

            const fnMock = _dependencies.todoRepository.list.mock
            assert.strictEqual(fnMock.callCount(), 1)
        });
    });

    describe("#create", () => {
        let _todoService;
        let _dependencies;
        beforeEach((context) => {

        })
    });
});