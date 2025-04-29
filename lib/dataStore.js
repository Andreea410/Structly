let entities = [
  { id: 1, title: 'Array', description: 'Array description', usageCount: 5 },
  { id: 2, title: 'Linked List', description: 'Linked list description', usageCount: 3 },
  { id: 3, title: 'Tree', description: 'Tree description', usageCount: 8 },
  { id: 4, title: 'Graph', description: 'Graph description', usageCount: 2 },
  { id: 5, title: 'Hash Table', description: 'Hash table description', usageCount: 6 }
];

export function setEntities(newEntities) {
  entities = newEntities;
}

export function getEntities() {
  return entities;
}

export function resetEntities() {
  entities = [];
}

export function getEntityById(id) {
  return entities.find(e => e.id.toString() === id.toString());
}

export function addEntity(entity) {
  if (!entity.id) {
    entity.id = Date.now().toString(36) + Math.random().toString(36).slice(2); 
  }

  entity.id = entity.id.toString(); 

  if (entities.some(e => e.id.toString() === entity.id)) {
    throw new Error("Entity with this ID already exists");
  }

  entities.push(entity);
  return entity;
}


export function updateEntity(id, updates) {
  let updated = null;
  entities = entities.map(e => {
    if (e.id.toString() === id.toString()) {
      updated = { ...e, ...updates };
      return updated;
    }
    return e;
  });
  return updated;
}

export function deleteEntity(id) {
  const initialLength = entities.length;
  entities = entities.filter(e => e.id.toString() !== id.toString());
  return entities.length < initialLength;
}

