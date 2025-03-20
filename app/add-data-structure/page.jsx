export default function AddDataStructure() {
    return (
      <div className="h-screen flex items-center justify-center bg-purple-200">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Add Data Structure</h2>
          <form>
            <input
              type="text"
              placeholder="Data Structure Title"
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              placeholder="Description"
              className="w-full p-2 border rounded mb-2"
            />

            <div className="fles items-center space-x-2 mt-2" >
                <input type="checkbox" 
                defaultChecked="off" 
                id = "addLinkCheckBox"
                checked = {addLink}
                onChange={ () => setAddLink(!addLink)}
                className = "w-4 h-4"/> 
                <label htmlFor="addLinkCheckbox" className = "text-sm text-gray-700">Do you want to add a link in the paragraph?</label>
            </div>
            
            <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700">
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }
  