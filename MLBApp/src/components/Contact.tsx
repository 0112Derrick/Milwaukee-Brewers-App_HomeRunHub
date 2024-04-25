import React, { useState } from "react";
import { Button } from "src/@/components/ui/button";
import { Card } from "src/@/components/ui/card";
import { Input } from "src/@/components/ui/input";
import axios from "axios";

const ContactUs = () => {
  const serverIp = "";
  const localhost = "http://localhost:8080/contact";
  const defaultIpAddress = serverIp || localhost;
  const [formSubmissionInProgress, setFormSubmissionInProgress] =
    useState(false);

  const [
    displayFormSubmissionPostSuccessful,
    setDisplayFormSubmissionPostSuccessful,
  ] = useState(false);

  const [formSubmissionPostSuccessful, setFormSubmissionPostSuccessful] =
    useState(false);

  const [error, setError] = useState<any>(null);

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(formData);
    //Sending data to a server
    //FIXME - Add a captcha in order to stop bots from spamming your api
    //FIXME - Sanitize user input prior to sending them to the server.
    setFormSubmissionInProgress(true);
    try {
      let response = await axios.post(defaultIpAddress, {
        ...formData,
      });

      if (response.status === 200) {
        setFormSubmissionPostSuccessful(true);
        setDisplayFormSubmissionPostSuccessful(true);

        setTimeout(() => {
          setFormSubmissionInProgress(false);
          setFormSubmissionPostSuccessful(false);
          setDisplayFormSubmissionPostSuccessful(false);
        }, 2000);
      } else {
        setFormSubmissionPostSuccessful(false);
        setDisplayFormSubmissionPostSuccessful(true);
      }
    } catch (error) {
      setError(error);
    } finally {
      setTimeout(() => {
        setFormSubmissionInProgress(false);
        setFormSubmissionPostSuccessful(false);
        setDisplayFormSubmissionPostSuccessful(false);
      }, 2000);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        <p className="text-red-500 font-bold text-2xl">
          Error: {error.message || "An error occurred."}
        </p>
      </div>
    );
  }

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
                  disabled={formSubmissionInProgress}
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
                  disabled={formSubmissionInProgress}
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
                  disabled={formSubmissionInProgress}
                ></textarea>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  type="submit"
                  disabled={formSubmissionInProgress}
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
      {formSubmissionInProgress &&
      displayFormSubmissionPostSuccessful &&
      formSubmissionPostSuccessful ? (
        <span className="bg-white rounded-md p-4 text-green-500 border border-green-500">
          Form submission was a success! Look forward to chatting with you soon.
        </span>
      ) : formSubmissionInProgress &&
        displayFormSubmissionPostSuccessful &&
        !formSubmissionPostSuccessful ? (
        <span className="bg-white rounded-md p-4 text-red-500 border border-red-500">
          There was a problem with the submission of your form data. Please try
          again.
        </span>
      ) : formSubmissionInProgress ? (
        <span className="bg-white rounded-md p-4 text-blue-500 border border-blue-500">
          Form submission in progress. Hang tight.
        </span>
      ) : null}
    </div>
  );
};

export default ContactUs;
