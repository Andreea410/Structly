// dataStructureService.test.js
const {
    calculateStatistics,
    filterDataStructures,
    paginateData,
    deleteDataStructure,
    incrementViewCount,
    generatePageNumbers
  } = require('../services/dataStructureService');
  
  describe('Data Structure Service', () => {
    const mockData = [
      { id: 1, title: 'Array', description: 'Array description', usageCount: 5 },
      { id: 2, title: 'Linked List', description: 'Linked list description', usageCount: 3 },
      { id: 3, title: 'Tree', description: 'Tree description', usageCount: 8 },
      { id: 4, title: 'Graph', description: 'Graph description', usageCount: 2 },
      { id: 5, title: 'Hash Table', description: 'Hash table description', usageCount: 6 }
    ];
  
    describe('calculateStatistics', () => {
      it('should return correct statistics for non-empty data', () => {
        const result = calculateStatistics(mockData);
        expect(result.mostUsed.title).toBe('Tree');
        expect(result.leastUsed.title).toBe('Graph');
        expect(result.averageUsage).toBe('4.80');
      });
  
      it('should return default values for empty data', () => {
        const result = calculateStatistics([]);
        expect(result.mostUsed.title).toBe('N/A');
        expect(result.leastUsed.title).toBe('N/A');
        expect(result.averageUsage).toBe(0);
      });
    });
  
    describe('filterDataStructures', () => {
      it('should filter by search query', () => {
        const result = filterDataStructures(mockData, 'array');
        expect(result.length).toBe(1);
        expect(result[0].title).toBe('Array');
      });
  
      it('should return all items for empty query', () => {
        const result = filterDataStructures(mockData, '');
        expect(result.length).toBe(mockData.length);
      });
    });
  
    describe('paginateData', () => {
      it('should return correct page items', () => {
        const result = paginateData(mockData, 1, 2);
        expect(result.length).toBe(2);
        expect(result[0].title).toBe('Array');
        expect(result[1].title).toBe('Linked List');
      });
  
      it('should handle out of range pages', () => {
        const result = paginateData(mockData, 10, 2);
        expect(result.length).toBe(0);
      });
    });
  
    describe('deleteDataStructure', () => {
      it('should remove the correct item', () => {
        const result = deleteDataStructure(mockData, 1);
        expect(result.length).toBe(mockData.length - 1);
        expect(result.find(ds => ds.id === 2)).toBeUndefined();
      });
    });
  
    describe('incrementViewCount', () => {
      it('should increment view count for specified item', () => {
        const itemToView = mockData[0];
        const result = incrementViewCount(mockData, itemToView);
        expect(result[0].usageCount).toBe(itemToView.usageCount + 1);
      });
  
      it('should not modify other items', () => {
        const itemToView = mockData[0];
        const result = incrementViewCount(mockData, itemToView);
        expect(result[1].usageCount).toBe(mockData[1].usageCount);
      });
    });
  
    describe('generatePageNumbers', () => {
      it('should generate correct page numbers', () => {
        const result = generatePageNumbers(mockData, 2);
        expect(result).toEqual([1, 2, 3]);
      });
  
      it('should return empty array for empty data', () => {
        const result = generatePageNumbers([], 2);
        expect(result).toEqual([]);
      });
    });


it('should not crash if index is out of bounds in deleteDataStructure', () => {
    const result = deleteDataStructure(mockData, 100);
    expect(result.length).toBe(mockData.length);
  });
  
  it('should not increment anything if item is not in the list', () => {
    const itemNotInList = { id: 999, title: 'Non-existent', usageCount: 1 };
    const result = incrementViewCount(mockData, itemNotInList);
    expect(result).toEqual(mockData);
  });
  
  it('should match search query regardless of case', () => {
    const result = filterDataStructures(mockData, 'LiNkEd');
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Linked List');
  });
  
  it('should return all items when itemsPerPage equals data length', () => {
    const result = paginateData(mockData, 1, mockData.length);
    expect(result.length).toBe(mockData.length);
  });
  
  it('should return correct page numbers when data fits evenly', () => {
    const data = [...mockData.slice(0, 4)];
    const result = generatePageNumbers(data, 2);
    expect(result).toEqual([1, 2]);
  });
  
  it('should return the first most/least used in case of tie', () => {
    const tieData = [
      { id: 1, title: 'A', usageCount: 2 },
      { id: 2, title: 'B', usageCount: 5 },
      { id: 3, title: 'C', usageCount: 5 },
      { id: 4, title: 'D', usageCount: 2 }
    ];
    const stats = calculateStatistics(tieData);
    expect(stats.mostUsed.title).toBe('C');
    expect(stats.leastUsed.title).toBe('D');
    
  });

  it('should return empty list if input is empty in incrementViewCount', () => {
    const result = incrementViewCount([], { id: 1 });
    expect(result).toEqual([]);
  });
  
  it('should return empty array when no items match the search query', () => {
    const result = filterDataStructures(mockData, 'nonexistent');
    expect(result).toEqual([]);
  });
  

  
  });