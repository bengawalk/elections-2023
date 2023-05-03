import * as React from "react";
import { map as lmap, sortBy as lsortBy } from "lodash";
import {Trans, withTranslation} from "react-i18next";
import {PARTY_ICONS} from "./utils";

const Content = ({ constituency, details, candidateDetails, lang, t }) => {
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

      <h2><Trans t={t} i18nKey="smla" />, <Trans t={t} i18nKey={details.elec_year} /> - <Trans t={t} i18nKey="2023" /></h2>
      <h4><Trans t={t} i18nKey="Name" /></h4>
      <div className="flex ac member">
        <img className="member-icon" src={details.mla_image ? `https://suvidha.eci.gov.in/uploads1/candprofile/E20/2023/AC/${details.mla_image}.jpg` : `/mla/${constituency}.webp`} alt="" />
        {details[`mla_${lang}`]}
      </div>

      <h4><Trans t={t} i18nKey="party" /></h4>
      <div className="flex member">
        <img className="party-icon" src={PARTY_ICONS[details.mla_party]} alt="" />
        <Trans t={t} i18nKey={details.mla_party} />
      </div>

      <h4><Trans t={t} i18nKey="news" /></h4>
      {
        [1, 2, 3, 4, 5, 6].map(index => {
          const link = details[`news_${index}_link`];
          if(link) {
            return (
              <a className="news-item" key={link} href={link} target="_blank">
                {(details[`news_${index}`] || "").replaceAll("\"", "")}
                <span className="material-icons">
                  open_in_new
                </span>
              </a>
            )
          }
          return null;
        })
      }

      {/*Candidates section*/}
      <h2><Trans t={t} i18nKey="2023" /> <Trans t={t} i18nKey="Candidates" /></h2>
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
        {
          lmap(lsortBy(candidateDetails, `name_${lang}`), (item) => (
            <tr key={item[`name_${lang}`]}>
              <td>
                <div className="flex ac member">
                  <img className="member-icon" src={`https://suvidha.eci.gov.in/uploads1/candprofile/E20/2023/AC/${item.image}.jpg`} alt="" />
                  {item[`name_${lang}`]}
                </div>
              </td>
              <td>
                <div className="flex ac member">
                  <img className="party-icon" src={PARTY_ICONS[item.party]} alt="" />
                  <Trans t={t} i18nKey={item.party} />
                </div>
              </td>
            </tr>
          ))
        }
        </tbody>
      </table>

      {/*Additional information*/}
      <h2>
        <Trans t={t} i18nKey="ai" />
      </h2>
      <div className="cons-news">
        <a className="news-item" href={details.cm_article} target="_blank">
          <Trans t={t} i18nKey="cm" />
          <span className="material-icons">
            open_in_new
          </span>
        </a>
        <a className="news-item" href="https://electoralsearch.eci.gov.in/" target="_blank">
          <Trans t={t} i18nKey="voter_search" />
          <span className="material-icons">
            open_in_new
          </span>
        </a>
      </div>

      <h2>
        <Trans t={t} i18nKey="scs" />
      </h2>
      <div className="cons-news">
        <a className="news-item" href="https://data.opencity.in/dataset/karnataka-assembly-elections-2023" target="_blank">
          2023 voter population by assembly constituencies, Open City
          <span className="material-icons">
            open_in_new
          </span>
        </a>

        <a className="news-item" href="https://affidavit.eci.gov.in/" target="_blank">
          List of candidates for 2023 elections, Election Commission of India
          <span className="material-icons">
            open_in_new
          </span>
        </a>
      </div>

    </>
  );
}

export default withTranslation()(Content);