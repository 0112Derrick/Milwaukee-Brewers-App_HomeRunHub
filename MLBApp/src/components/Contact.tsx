import React, { useState } from "react";
import { Button } from "src/@/components/ui/button";
import { Card } from "src/@/components/ui/card";
import { Input } from "src/@/components/ui/input";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Here you would typically handle the submission, like sending data to a server
    console.log(formData);
    alert("Thank you for your message!");
  };

  return (
    <div className="container flex flex-col flex-grow px-4 py-12 items-center justify-center">
      <Card className="mx-auto bg-white rounded-lg overflow-hidden w-3/4">
        <div className="md:flex">
          <div className="w-full p-4">
            <div className="mb-4">
              <h1 className="font-bold text-xl">Contact Us</h1>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-grey-darker text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <Input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
                  id="name"
                  type="text"
                  placeholder="Your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-grey-darker text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
                  id="email"
                  type="email"
                  placeholder="Your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-grey-darker text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
                  id="message"
                  placeholder="Your message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  type="submit"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContactUs;
