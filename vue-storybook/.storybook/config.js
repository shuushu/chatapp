// config.js
import { configure } from '@storybook/vue';

function loadStories() {
    // You can require as many stories as you need.
    require('../stories/index.js');
}

configure(loadStories, module);