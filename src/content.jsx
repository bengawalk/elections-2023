import * as React from "react";
import {Trans, withTranslation} from "react-i18next";

import IconBjp from "./assets/images/icon_bjp.webp";
import IconCongress from "./assets/images/icon_congress.webp";
import IconJds from "./assets/images/icon_jds.webp";

const PARTY_ICONS = {
  bjp: IconBjp,
  inc: IconCongress,
  jds: IconJds,
};

const Content = ({ constituency, details, lang, t }) => {
  return (
    <>
      <h2>
        <Trans t={t} i18nKey="About" />
      </h2>
      <h4>
        <Trans t={t} i18nKey="vp" />
      </h4>
      <p>{parseInt(details.pop.substring(0, 3)) / 100} <Trans t={t} i18nKey="lakh" /></p>
      <h4><Trans t={t} i18nKey="area" /></h4>
      <p>{details.area} <Trans t={t} i18nKey="sqkm" /></p>

      <h2><Trans t={t} i18nKey="smla" />, {details.elec_year} - 2023</h2>
      <h4><Trans t={t} i18nKey="Name" /></h4>
      <div className="flex">
        <img className="member-icon" src={`/mla/${constituency}.webp`} alt="" />
        {details[`mla_${lang}`]}
      </div>

      <h4><Trans t={t} i18nKey="party" /></h4>
      <div className="flex">
        <img className="member-icon" src={PARTY_ICONS[details.mla_party]} alt="" />
        <Trans t={t} i18nKey={details.mla_party} />
      </div>

      <h4><Trans t={t} i18nKey="news" /></h4>
      {
        [1, 2, 3, 4].map(index => {
          const link = details[`news_${index}_link`];
          if(link) {
            return (
              <a className="news-item" href={link} target="_blank">
                {details[`news_${index}_${lang}`].replaceAll("\"", "")}
                <span className="material-icons">
                  open_in_new
                </span>
              </a>
            )
          }
          return null;
        })
      }
      <h2>2023 <Trans t={t} i18nKey="Candidates" /></h2>
      <table className="candidates-table">
        <thead>
        <tr>
          <th>
            <h4><Trans t={t} i18nKey="Name" /></h4>
          </th>
          <th>
            <h4><Trans t={t} i18nKey="party" /></h4>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            <div className="flex">
              <div className="member-icon"></div>
              Candidate 1
            </div>
          </td>
          <td>
            <div className="member-icon"></div>
          </td>
        </tr>
        <tr>
          <td>
            <div className="flex">
              <div className="member-icon"></div>
              Candidate 2
            </div>
          </td>
          <td>
            <div className="member-icon"></div>
          </td>
        </tr>
        </tbody>
      </table>
    </>
  );
}

export default withTranslation()(Content);