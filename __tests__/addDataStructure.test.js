const { createDataStructure } = require('../services/addDataLogic');

describe('createDataStructure', () => {
  it('should return null if title or description is missing', () => {
    const result = createDataStructure({
      title: '',
      description: 'Some desc',
      paragraphs: [],
    });
    expect(result).toBeNull();
  });

  it('should create a structure with text only paragraphs', () => {
    const result = createDataStructure({
      title: 'Stack',
      description: 'LIFO structure',
      paragraphs: [{ text: 'First paragraph', addLink: false }],
    });

    expect(result).toEqual({
      title: 'Stack',
      description: 'LIFO structure',
      paragraphs: [{ text: 'First paragraph' }],
      usageCount: 0,
      id: 1234567890,
    });
  });

  it('should include link if addLink is true and linkType is provided', () => {
    const result = createDataStructure({
      title: 'Queue',
      description: 'FIFO structure',
      paragraphs: [
        {
          text: 'With link',
          addLink: true,
          linkType: 'video',
          file: { name: 'video.mp4', type: 'video/mp4', data: 'fake-data' },
        },
      ],
    });

    expect(result.paragraphs[0].link).toEqual({
      type: 'video',
      file: { name: 'video.mp4', type: 'video/mp4', data: 'fake-data' },
    });
    
  });
});
