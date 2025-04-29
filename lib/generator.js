let counter = 0;

export function startEntityGenerator(io) {
  setInterval(() => {
    const newEntity = {
      id: `entity-${counter++}`,
      title: `Generated #${counter}`,
      usageCount: Math.floor(Math.random() * 100),
    };

    console.log("New entity generated", newEntity);

    io.emit("new-entity", newEntity); // Push to all clients
  }, 5000); // every 5 seconds
}
