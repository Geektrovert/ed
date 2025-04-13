export const defaultEditorContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Exploring Functional Programming" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://en.wikipedia.org/wiki/Functional_programming",
                target: "_blank",
              },
            },
          ],
          text: "Functional Programming",
        },
        {
          type: "text",
          text: " is a programming paradigm that treats computation as the evaluation of mathematical functions. Built with concepts from ",
        },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://en.wikipedia.org/wiki/Lambda_calculus",
                target: "_blank",
              },
            },
          ],
          text: "Lambda Calculus",
        },
        { type: "text", text: " and " },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://en.wikipedia.org/wiki/Category_theory",
                target: "_blank",
              },
            },
          ],
          text: "Category Theory",
        },
        { type: "text", text: "." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Core Principles" }],
    },
    {
      type: "codeBlock",
      attrs: { language: null },
      content: [{ type: "text", text: "// Pure functions have no side effects\nconst add = (a, b) => a + b;" }],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Example in JavaScript" }],
    },
    {
      type: "codeBlock",
      attrs: { language: null },
      content: [
        {
          type: "text",
          text: '// Functional approach to data transformation\nconst numbers = [1, 2, 3, 4, 5];\n\nconst doubled = numbers.map(n => n * 2);\nconst filtered = doubled.filter(n => n > 5);\nconst sum = filtered.reduce((acc, n) => acc + n, 0);\n\nconsole.log(sum); // 22',
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Key Concepts" }],
    },
    {
      type: "orderedList",
      attrs: { tight: true, start: 1 },
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "First-class and higher-order functions" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Pure functions (use " },
                { type: "text", marks: [{ type: "code" }], text: "=>" },
                {
                  type: "text",
                  text: " for lambdas in most modern languages)",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Immutability (avoid mutation, create new values instead) ",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Recent thoughts from the community:",
                },
              ],
            },
            {
              type: "twitter",
              attrs: {
                src: "https://x.com/dillon_mulroy/status/1742347151940690371",
              },
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Mathematical foundations are evident in these expressions:",
                },
              ],
            },
            {
              type: "orderedList",
              attrs: {
                tight: true,
                start: 1,
              },
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "math",
                          attrs: {
                            latex: "f(x) = x^2",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "math",
                          attrs: {
                            latex: "compose(f, g) = f \\circ g = f(g(x))",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "math",
                          attrs: {
                            latex: "map(f, [x_1, x_2, ..., x_n]) = [f(x_1), f(x_2), ..., f(x_n)]",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "math",
                          attrs: {
                            latex: "M=\\begin{bmatrix}a&b\\\\c&d \\end{bmatrix}",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "math",
                          attrs: {
                            latex: "reduce(f, [x_1, x_2, ..., x_n], init) = f(...f(f(init, x_1), x_2), ..., x_n)",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Learn more" }],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Read " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://github.com/getify/Functional-Light-JS",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Functional-Light JavaScript",
                },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Explore " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://www.npmjs.com/package/ramda",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Ramda.js",
                },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://ellie-app.com/new",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Try Elm online",
                },
                { type: "text", text: " for pure functional programming" },
              ],
            },
          ],
        },
      ],
    },
  ],
};
