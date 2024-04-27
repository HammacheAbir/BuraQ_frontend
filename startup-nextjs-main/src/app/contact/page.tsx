import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us for Emergency Evacuation Solutions | YourProduct Name",
  description:
    "Connect with us to enhance your evacuation plans using our innovative solutions.",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact Us"
        description="Connect with us to enhance your evacuation plans using our innovative solutions"
      />

      <Contact />
    </>
  );
};

export default ContactPage;
