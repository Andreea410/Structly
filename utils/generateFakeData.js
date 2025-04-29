import { faker } from '@faker-js/faker';

export const generateFakeDataStructures = (count = 10) => {
  const dataStructures = [];
  
  for (let i = 0; i < count; i++) {
    dataStructures.push({
      title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
      description: faker.lorem.sentence(),
      paragraphs: [
        { text: faker.lorem.paragraphs(2) },
        { 
          text: faker.lorem.paragraphs(1),
          link: faker.datatype.boolean() ? {
            type: 'image',
            file: {
              name: 'example.jpg',
              data: faker.image.urlLoremFlickr({ category: 'computer' })
            }
          } : null
        }
      ],
      usageCount: faker.number.int({ min: 0, max: 100 }),
      id: faker.string.uuid(), 
    });
  }
  
  return dataStructures;
};