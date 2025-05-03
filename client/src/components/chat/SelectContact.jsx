import { useState } from "react";
import { HOST } from "../../utils/constants";
import { getShortName } from "../../utils";
import Avatar from "../common/Avatar";

export default function MultiSelect({ contacts = [], selectedContacts = [], setSelectedContacts = () => {} }) {
  const [search, setSearch] = useState("");

  const handleRemove = (id) => {
    setSelectedContacts((prev) => prev.filter((c) => c._id !== id));
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedContacts.some((sel) => sel._id === c._id)
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search Input with Tags */}
      <div className="bg-gray-200 py-2 px-3 border border-gray-300 rounded-md text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-indigo-300 transition w-full">
        <div className="flex flex-wrap items-center gap-2">
          {selectedContacts.map((contact) => (
            <div
              key={contact._id}
              className="flex items-center bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full text-sm"
            >
              {contact.name}
              <button
                className="ml-1 text-indigo-700 hover:text-red-600"
                onClick={() => handleRemove(contact._id)}
              >
                &times;
              </button>
            </div>
          ))}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="flex-1 bg-transparent focus:outline-none text-black placeholder:text-gray-500 min-w-[120px]"
          />
        </div>
      </div>

      {/* Filtered Contact List */}
      <div className="w-full mt-2 flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => {
          const { image, name, _id, color, email } = contact;
          return (
            <div
              key={_id}
              className="flex items-start justify-start gap-4 py-2 px-3 hover:bg-indigo-100 cursor-pointer break-words"
              onClick={() => {
                setSelectedContacts((prev) => [...prev, contact])
                setSearch('')
              }}
            >
              <Avatar
                image={
                  image instanceof File
                    ? URL.createObjectURL(image)
                    : image
                    ? `${HOST}/${image}`
                    : ""
                }
                className="bg-gray-200 size-10 md:size-12 rounded-full shadow-md"
                textSize="text-sm md:text-base lg:text-lg"
                color={color}
                text={getShortName(name)}
              />
              <div className="flex flex-col space-y-1 w-0 flex-1 overflow-hidden">
                <div className="text-sm md:text-base lg:text-lg font-semibold text-gray-700 break-words whitespace-normal">
                  {name}
                </div>
                <div className="text-xs md:text-sm lg:text-md text-gray-500 break-words whitespace-normal">
                  {email}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
