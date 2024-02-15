import { describe, it, beforeEach, before, after, afterEach } from "node:test";
import TodoService from "../src/todoService.js";
import assert from "node:assert";
import Todo from "../src/todo.js";
import crypto from "node:crypto";
import sinon from "sinon";

describe("Todo Service test Suite", () => {
    describe("#list", () => {
        let _todoService;
        let _dependencies;

        const mockDatabase = [
            {
              text: 'I must plan my trip to Europe',
              when: new Date('2024-12-15 12:00:00 GMT-0'),
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
            const expected = mockDatabase.map(({ text, ...result }) => (new Todo({ text: text.toUpperCase(), ...result })));
            const result = await _todoService.list();
            assert.deepStrictEqual(result, expected);

            const fnMock = _dependencies.todoRepository.list.mock
            assert.strictEqual(fnMock.callCount(), 1)
        });
    });

    describe("#create", () => {
        let _todoService;
        let _dependencies;
        let _sandbox;

        const mockCreateResult = {
            text: 'I must plan my trip to Europe',
            when: new Date('2020-12-15 12:00:00 GMT-0'),
            status: 'late',
            id: 'd7ccbf34-94f9-42aa-8ca3-fc526f09aeb1'
        }
        const DEFAULT_ID = mockCreateResult.id;

        before(() => {
            crypto.randomUUID = () => DEFAULT_ID;
            _sandbox = sinon.createSandbox()
        })

        after(async () => {
            crypto.randomUUID = (await import('node:crypto')).randomUUID
        })

        beforeEach((context) => {
            _dependencies = {
                todoRepository: {
                    create: context.mock.fn(async () => mockCreateResult)
                }
            }

            _todoService = new TodoService(_dependencies);
        })

        afterEach(() => _sandbox.restore())

        it("shouldn't save todo item when item with invali data", async () => {
            const input = new Todo({
                text: '',
                when: ''
            });

            const expected = {
                error: {
                    message: 'invalid data',
                    data: {
                        text: '',
                        when: '',
                        status: '',
                        id: DEFAULT_ID
                    }
                }
            }

            const result =  await _todoService.create(input);
            
            assert.deepStrictEqual(JSON.stringify(result), JSON.stringify(expected));
        });

        it("should save todo item with late status when the property is further then today", async () => {
            const properties = {
                text: "I must plan my trip to Chile",
                when: new Date('2020-12-15 12:00:00 GMT-0'),
            };

            const input = new Todo(properties);
            const expected = {
                ...properties,
                status: 'late',
                id: DEFAULT_ID
            }

            const today = new Date('2020-12-16');
            _sandbox.useFakeTimers(today.getTime());

            await _todoService.create(input);

            const fnMock = _dependencies.todoRepository.create.mock;

            assert.deepStrictEqual(fnMock.callCount(), 1);
            assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected)
            
        });

        it("should save todo item with late status when the property is in the past", async () => {
            const properties = {
                text: "I must plan my trip to Chile",
                when: new Date('2020-12-15 12:00:00 GMT-0'),
            };

            const input = new Todo(properties);
            const expected = {
                ...properties,
                status: 'pending',
                id: DEFAULT_ID
            }

            const today = new Date('2020-12-04');
            _sandbox.useFakeTimers(today.getTime());

            await _todoService.create(input);

            const fnMock = _dependencies.todoRepository.create.mock;

            assert.deepStrictEqual(fnMock.callCount(), 1);
            assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected)
            
        });
    });
});