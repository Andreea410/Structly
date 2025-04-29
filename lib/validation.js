
export const validateEntity = (entity) => {
    const errors = [];
    if (!entity.title) errors.push("Title is required");
    if (!entity.description) errors.push("Description is required");
    if (entity.description?.length > 250) errors.push("Description max length: 250 chars");
    return errors;
  };
  