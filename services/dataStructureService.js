// dataStructureService.js

function calculateStatistics(data) {
    if (data.length === 0) {
      return {
        mostUsed: { title: "N/A", usageCount: 0 },
        leastUsed: { title: "N/A", usageCount: 0 },
        averageUsage: 0,
      };
    }
  
    const mostUsed = data.reduce((prev, current) =>
      (prev.usageCount || 0) > (current.usageCount || 0) ? prev : current
    );
    const leastUsed = data.reduce((prev, current) =>
      (prev.usageCount || 0) < (current.usageCount || 0) ? prev : current
    );
    const averageUsage =
      data.reduce((sum, ds) => sum + (ds.usageCount || 0), 0) / data.length;
  
    return {
      mostUsed,
      leastUsed,
      averageUsage: averageUsage.toFixed(2),
    };
  }
  
  function filterDataStructures(dataStructures, searchQuery) {
    return dataStructures.filter((ds) =>
      ds.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  function paginateData(data, currentPage, itemsPerPage) {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  }
  
  function deleteDataStructure(dataStructures, index) {
    const updatedList = [...dataStructures];
    updatedList.splice(index, 1);
    return updatedList;
  }
  
  function incrementViewCount(dataStructures, item) {
    return dataStructures.map(ds =>
      ds.id === item.id
        ? { ...ds, usageCount: (ds.usageCount || 0) + 1 }
        : ds
    );
  }
  
  function generatePageNumbers(filteredData, itemsPerPage) {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredData.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }
  
  module.exports = {
    calculateStatistics,
    filterDataStructures,
    paginateData,
    deleteDataStructure,
    incrementViewCount,
    generatePageNumbers
  };
  