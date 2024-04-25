import React, { useRef, useState } from "react";
import { Button } from "src/@/components/ui/button";
import { Card } from "src/@/components/ui/card";
import { Input } from "src/@/components/ui/input";
import axios, { AxiosError } from "axios";
import Dompurify from "dompurify";
import { formDataI } from "src/interfaces";
import { useNavigate} from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "src/@/components/ui/dropdown-menu";
import {
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

const ContactUs = () => {
  const serverIp = "";
  const localhost = "http://localhost:8080/contact";
  const defaultIpAddress = serverIp || localhost;
  const [formSubmissionInProgress, setFormSubmissionInProgress] =
    useState(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const contactForm = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  const [
    displayFormSubmissionPostSuccessful,
    setDisplayFormSubmissionPostSuccessful,
  ] = useState(false);

  const [formSubmissionPostSuccessful, setFormSubmissionPostSuccessful] =
    useState(false);

  const [error, setError] = useState<any>(null);

  const [formData, setFormData] = useState<formDataI>({
    name: "",
    email: "",
    message: "",
    reasonForContact: "Inquiry",
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

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      alert("Email was invalid.");
      return;
    }

    setFormSubmissionInProgress(true);
    try {
      const sanitizedInputs: formDataI = {
        name: Dompurify.sanitize(formData.name),
        email: Dompurify.sanitize(formData.email),
        message: Dompurify.sanitize(formData.message),
        reasonForContact: Dompurify.sanitize(formData.reasonForContact),
      };

      let response = await axios.post(defaultIpAddress, {
        ...sanitizedInputs,
      });

      if (response.status === 200) {
        setResponseMessage(response.data.message);
        setFormSubmissionPostSuccessful(true);
        setDisplayFormSubmissionPostSuccessful(true);
      } else {
        setFormSubmissionPostSuccessful(false);
        setDisplayFormSubmissionPostSuccessful(true);
      }
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setTimeout(() => {
        setResponseMessage("");
        setFormSubmissionInProgress(false);
        setFormSubmissionPostSuccessful(false);
        setDisplayFormSubmissionPostSuccessful(false);
        navigate("/");
      }, 4000);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow font-bold text-xl text-red-500 ">
        <h1 className="text-2xl py-8 pt-12 sm:py-4 text-center">
          Sorry something went wrong:
        </h1>
        <div className="w-4/5 h-fit bg-white p-4 rounded flex flex-col justify-center overflow-x-scroll">
          <p className="">
            Error Status code:{" "}
            <span className="text-black">
              {(error as AxiosError).response?.status}
            </span>
          </p>
          <p className="">
            Error name:{" "}
            <span className="text-black">
              {(error as AxiosError).response?.statusText}
            </span>
          </p>
          <p className="">
            Server response:{" "}
            <span className="text-black">{error.response?.data?.message}</span>
          </p>
        </div>
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
            <form ref={contactForm} onSubmit={handleSubmit}>
              <div className="mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <span className="flex gap-1 items-center justify-center bg-blue-500 p-2 hover:bg-blue-600 shadow hover:shadow-none shadow-black rounded text-white">
                      Reason For Contact: {formData.reasonForContact}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="p-4 outline-none">
                    <DropdownMenuLabel className="flex items-center justify-center">
                      Reason For Contact
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator></DropdownMenuSeparator>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        handleChange({
                          target: {
                            name: "reasonForContact",
                            value: "Inquiry",
                          },
                        })
                      }
                      disabled={formData.reasonForContact === "Inquiry"}
                    >
                      Inquiry
                    </DropdownMenuItem>
                    <DropdownMenuSeparator></DropdownMenuSeparator>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        handleChange({
                          target: {
                            name: "reasonForContact",
                            value: "Product",
                          },
                        })
                      }
                      disabled={formData.reasonForContact === "Product"}
                    >
                      Product
                    </DropdownMenuItem>
                    <DropdownMenuSeparator></DropdownMenuSeparator>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        handleChange({
                          target: {
                            name: "reasonForContact",
                            value: "Services",
                          },
                        })
                      }
                      disabled={formData.reasonForContact === "Services"}
                    >
                      Services
                    </DropdownMenuItem>
                    <DropdownMenuSeparator></DropdownMenuSeparator>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        handleChange({
                          target: {
                            name: "reasonForContact",
                            value: "Marketing/Sales",
                          },
                        })
                      }
                      disabled={formData.reasonForContact === "Marketing/Sales"}
                    >
                      Marketing/Sales
                    </DropdownMenuItem>
                    <DropdownMenuSeparator></DropdownMenuSeparator>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        handleChange({
                          target: {
                            name: "reasonForContact",
                            value: "Event Opportunities",
                          },
                        })
                      }
                      disabled={
                        formData.reasonForContact === "Event Opportunities"
                      }
                    >
                      Event Opportunities
                    </DropdownMenuItem>
                    <DropdownMenuSeparator></DropdownMenuSeparator>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        handleChange({
                          target: {
                            name: "reasonForContact",
                            value: "Partnership Opportunities",
                          },
                        })
                      }
                      disabled={
                        formData.reasonForContact ===
                        "Partnership Opportunities"
                      }
                    >
                      Partnership Opportunities
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                  className="bg-blue-500 hover:bg-blue-700 hover:shadow-lg shadow-black text-white font-bold py-2 px-4 rounded"
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
        <span className="bg-white rounded-md p-4 text-green-700 border border-green-500 text-lg">
          Form submission was a success! Look forward to chatting with you soon.{" "}
          {responseMessage && (
            <span className="text-blue-700 text-lg">
              <br></br>
              Server message: {responseMessage}
            </span>
          )}
        </span>
      ) : formSubmissionInProgress &&
        displayFormSubmissionPostSuccessful &&
        !formSubmissionPostSuccessful ? (
        <span className="bg-white rounded-md p-4 text-red-500 border border-red-500 text-lg">
          There was a problem with the submission of your form data. Please try
          again.
        </span>
      ) : formSubmissionInProgress ? (
        <span className="bg-white rounded-md p-4 text-blue-500 border border-blue-500 text-lg">
          Form submission in progress. Hang tight.
        </span>
      ) : null}
    </div>
  );
};

export default ContactUs;
