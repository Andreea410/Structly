function createDataStructure({ title, description, paragraphs }) {
    if (!title || !description) return null;
  
    return {
      title,
      description,
      paragraphs: paragraphs.map((p) => ({
        text: p.text,
        ...(p.addLink && p.linkType && {
          link: {
            type: p.linkType,
            ...(p.file && { file: p.file }),
          },
        }),
      })),
      usageCount: 0,
      id: 1234567890, 
    };
  }
  
  module.exports = { createDataStructure };
  