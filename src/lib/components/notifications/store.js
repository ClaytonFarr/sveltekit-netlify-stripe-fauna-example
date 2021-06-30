import { writable } from "svelte/store"

const id = () => '_' + Math.random().toString(36).substr(2, 9);

const createNotificationStore = () => {

	const timeoutIds = new Set();

	const _notifications = writable([], () => {
		return () => {
			// clear all the timers
			timeoutIds.forEach(timeoutId => {
				clearTimeout(timeoutId);
			});
			_notifications.set([]);
		}
	});

  const publish = ({message, detail = null, type = "default", dismissable = true, secondsDisplayed = 5}) => {
		let _id = id();
    _notifications.update(state => {
      return [...state, { id: _id, type, message, detail, dismissable, secondsDisplayed }]
    });
		const timeoutId = setTimeout(() => {
			dismiss(_id);
		}, secondsDisplayed * 1000);
		timeoutIds.add(timeoutId);
	}

	const dismiss = (_id) => {
		_notifications.update(state => {
			return state.filter(({ id }) => id !== _id);
		});
	}

  const { subscribe } = _notifications

  return {
    subscribe,
    publish,
		dismiss, 
    default: ({message, detail, dismissable, secondsDisplayed }) => publish({message, detail, dismissable, secondsDisplayed}),
    info: ({message, detail, dismissable, secondsDisplayed }) => publish({message, detail, dismissable, secondsDisplayed, type: "info"}),
    success: ({message, detail, dismissable, secondsDisplayed }) => publish({message, detail, dismissable, secondsDisplayed, type: "success"}),
    warning: ({message, detail, dismissable, secondsDisplayed }) => publish({message, detail, dismissable, secondsDisplayed, type: "warning"}),
    danger: ({message, detail, dismissable, secondsDisplayed }) => publish({message, detail, dismissable, secondsDisplayed, type: "danger"}),
  }
}

export const notifications = createNotificationStore()