import intro from "intro.js";

export function startGuide(firstName: string) {
  intro().
  setOptions({
    steps: [
      {
        title: 'Orders Management Guide',
        intro: `Hello <b>${firstName}</b>!👋<br/> Here is a guide to help you use this orders management tool.`,
      },
      {
        title: 'First step',
        element: document.querySelector<HTMLElement>(`#shop0`)!,
        intro: 'First select the shop you want to manage orders from.',
      },
      {
        title: 'List of orders',
        element: document.querySelector<HTMLElement>(`#orderNum0`)!,
        intro: 'You may now select one or multiple orders to manage at the same time.<br/><small>It may take a few seconds to load the orders, so be patient ;).</small>',
      },
      {
        title: 'Operations',
        element: document.querySelector<HTMLElement>(`#operation0`)!,
        intro: 'Here you must select what type of operation you want to perform on the selected order(s).<br/><br/>' +
          'Note : If you want to <b>Edit recipient\'s information</b>, you must select one order at a time.',
      },
      {
        title: 'Performing multiple operations',
        element: document.querySelector<HTMLElement>(`#addRow`)!,
        intro: 'You can perform multiple operations by adding a new row.',
      },
      {
        title: 'Need help?',
        element: document.querySelector<HTMLElement>(`#helpButton`)!,
        intro: 'If you need help, you can click here to get more information.',
      }
    ],
  })
    .start();
  localStorage.clientOrdersManagementGuideWatched = 'true';
}
