const {
    getEntities,
    getEntityById,
    addEntity,
    updateEntity,
    deleteEntity,
    resetEntities,
    setEntities
  } = require('../lib/dataStore'); 
  
  describe('Data Store', () => {
    beforeEach(() => {
      resetEntities();
      setEntities([
        { id: 1, title: 'Array', description: 'Array description', usageCount: 5 },
        { id: 2, title: 'Linked List', description: 'Linked list description', usageCount: 3 },
        { id: 3, title: 'Tree', description: 'Tree description', usageCount: 8 },
        { id: 4, title: 'Graph', description: 'Graph description', usageCount: 2 },
        { id: 5, title: 'Hash Table', description: 'Hash table description', usageCount: 6 },
      ]);
      
    });
  
    describe('getEntities', () => {
      it('should return all entities', () => {
        const result = getEntities();
        expect(result.length).toBe(5);
        expect(result[0].title).toBe('Array');
      });
    });
  
    describe('getEntityById', () => {
      it('should return the correct entity', () => {
        const result = getEntityById(1);
        expect(result.title).toBe('Array');
      });
  
      it('should return undefined for non-existent id', () => {
        const result = getEntityById(999);
        expect(result).toBeUndefined();
      });
    });
  
    describe('addEntity', () => {
      it('should add a new entity', () => {
        const newEntity = { title: 'Stack', description: 'Stack description' };
        const result = addEntity(newEntity);
        expect(result.id).toBeDefined();
        expect(getEntities().length).toBe(6);
      });
  
      it('should throw error for duplicate id', () => {
        const entity = { id: 1, title: 'Duplicate' };
        expect(() => addEntity(entity)).toThrow('Entity with this ID already exists');
      });
    });
  
    describe('updateEntity', () => {
      it('should update an existing entity', () => {
        const updates = { title: 'Updated Array' };
        const result = updateEntity(1, updates);
        expect(result.title).toBe('Updated Array');
        expect(getEntityById(1).title).toBe('Updated Array');
      });
  
      it('should return null for non-existent id', () => {
        const result = updateEntity(999, {});
        expect(result).toBeNull();
      });
    });
  
    describe('deleteEntity', () => {
      it('should delete an existing entity', () => {
        const result = deleteEntity(1);
        expect(result).toBe(true);
        expect(getEntities().length).toBe(4);
      });
  
      it('should return false for non-existent id', () => {
        const result = deleteEntity(999);
        expect(result).toBe(false);
      });
    });
  });