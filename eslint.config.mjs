/*
 * eslint-config-next 16 ships its flat configs as package exports, so the
 * eslintrc `FlatCompat` bridge this file used on 15.x is gone. Extending the
 * legacy `next/core-web-vitals` name through FlatCompat against the 16 package
 * throws "Converting circular structure to JSON" out of the eslintrc config
 * validator (LAC-6482).
 */
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript];

export default eslintConfig;
