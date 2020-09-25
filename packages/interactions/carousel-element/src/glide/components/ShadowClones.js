import GlideClonesComponent from '@glidejs/glide/src/components/clones';

export default function (Glide, Components, Events) {
	const glideClones = GlideClonesComponent(Glide, Components, Events);

	glideClones.append = () => {
		const wrapper = Components.Html.host;

		let { items } = glideClones;
		let { slides } = Components.Html;

		let half = Math.floor(items.length / 2);
		let prepend = items.slice(0, half).reverse();
		let append = items.slice(half, items.length);
		let width = `${Components.Sizes.slideWidth}px`;

		for (let i = 0; i < append.length; i++) {
			wrapper.appendChild(append[i]);
		}

		for (let i = 0; i < prepend.length; i++) {
			wrapper.insertBefore(prepend[i], slides[0]);
		}

		for (let i = 0; i < items.length; i++) {
			items[i].style.width = width;
		}
	};
	glideClones.remove = () => {
		const wrapper = Components.Html.host;
		let { items } = glideClones;

		for (let i = 0; i < items.length; i++) {
			try {
				wrapper.removeChild(items[i]);
			} catch (e) {}
		}
	};

	return glideClones;
}
