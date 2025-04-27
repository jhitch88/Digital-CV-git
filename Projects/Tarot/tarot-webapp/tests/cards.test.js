const { loadCardData, selectRandomCard } = require('../src/js/cards');

describe('Tarot Card Functions', () => {
    let cardData;

    beforeAll(() => {
        cardData = loadCardData();
    });

    test('loadCardData should return an array of cards', () => {
        expect(Array.isArray(cardData)).toBe(true);
        expect(cardData.length).toBeGreaterThan(0);
    });

    test('selectRandomCard should return a card object', () => {
        const card = selectRandomCard(cardData);
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('image');
        expect(card).toHaveProperty('interpretation');
    });
});