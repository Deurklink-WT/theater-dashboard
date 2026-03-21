const { buildItixSeatingPlanUrl, pickItixSeatingPlanEventId } = require('./itix-seating-url');

describe('buildItixSeatingPlanUrl', () => {
  const base = 'https://tickets.example.nl/beheer/zaalplattegrond/uitvoeringinfo';

  test('bouwt URL met event-id', () => {
    expect(buildItixSeatingPlanUrl(base, 'abc-123')).toBe(
      'https://tickets.example.nl/beheer/zaalplattegrond/uitvoeringinfo/abc-123'
    );
  });

  test('encodeert speciale tekens in id', () => {
    expect(buildItixSeatingPlanUrl(base, 'id/with/slash')).toBe(
      'https://tickets.example.nl/beheer/zaalplattegrond/uitvoeringinfo/id%2Fwith%2Fslash'
    );
  });

  test('stript trailing slashes van base', () => {
    expect(buildItixSeatingPlanUrl(`${base}/`, '99')).toBe(`${base}/99`);
  });

  test('leeg bij geen base', () => {
    expect(buildItixSeatingPlanUrl('', '1')).toBe('');
    expect(buildItixSeatingPlanUrl(null, '1')).toBe('');
  });

  test('leeg bij geen event-id', () => {
    expect(buildItixSeatingPlanUrl(base, '')).toBe('');
    expect(buildItixSeatingPlanUrl(base, null)).toBe('');
  });

  test('numeriek id', () => {
    expect(buildItixSeatingPlanUrl(base, 42)).toBe(`${base}/42`);
  });
});

describe('pickItixSeatingPlanEventId', () => {
  const longYesplanId = '5298708737-1744626436';

  test('gebruikt ticketingId i.p.v. lang Yesplan event.id', () => {
    expect(
      pickItixSeatingPlanEventId({
        id: longYesplanId,
        ticketingId: '8036'
      })
    ).toBe('8036');
  });

  test('valt terug op rawEvent.ticketing.id', () => {
    expect(
      pickItixSeatingPlanEventId({
        id: longYesplanId,
        rawEvent: { ticketing: { id: '999' } }
      })
    ).toBe('999');
  });

  test('valt terug op event.id als geen ticketing', () => {
    expect(pickItixSeatingPlanEventId({ id: 'alleen-dit' })).toBe('alleen-dit');
  });
});
