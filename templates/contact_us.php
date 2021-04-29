<?php
    include("connect.php");
    $posted=false;
    if(isset($_POST['reg'])){
        $posted=true;
        $name = $_POST['name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'];
        $country = $_POST['country'];
        $message = $_POST['message'];
        $sql = "INSERT INTO data (name,email,phone,country,message) VALUES ('$name','$email', '$phone','$country','$message')";
        mysqli_query($db,$sql);
        $done=true;
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us</title>
    
    <script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

    <link rel="stylesheet" href="../static/bootstrapcss.css" type="text/css">
    <link rel="stylesheet" href="../static/style.css" type="text/css">
    <style>
        body {
            padding: 20px 0;
            font-family: Lato, sans-serif;
          }
          
    </style>
</head>
<body class="generic-page base-page page basicpage" id="sidenav-hide">
<?php
    if( $posted ) 
    if($done)
        echo "<script type='text/javascript'>alert('Thank you for your interest in Aadivas Foods. Our team will get back to you via call/email to share the quote.')</script>";
      else
        echo "<script type='text/javascript'>alert('failed!')</script>";
  ?>
    <div class="root responsivegrid">
        <div class="aem-Grid aem-Grid--12 aem-Grid--default--12 ">
            <div class="responsivegrid Theme aem-GridColumn aem-GridColumn--default--12">
                <div class="aem-Grid aem-Grid--12 aem-Grid--default--12 ">
                    <div class="meganav oil aem-GridColumn aem-GridColumn--default--12">
                        <div class="megamenu-container">
                            <div class="megamenu-main aadivas-container">
                                <a href="home.html" class="megamenu-aadivas-logo">
                                    <img src="../static/media/logo.png" style="height: 50px; width:150px;"/>
                                </a>
                                <nav class="megamenu-tier1">
                                    <ul class="megamenu-tier1-list" role="menubar">
                                        <li class="megamenu-tier1-list-item" role="menuitem">
                                            <a class="megamenu-tier1-list-text aadivas-text-p3" href="home.html">Home</a>
                                        </li>
                                        <li class="megamenu-tier1-list-item" role="menuitem">
                                            <a class="megamenu-tier1-list-text aadivas-text-p3" href="about_us.html">About Us</a>
                                            <div class="megamenu-tier1-desc megamenu-hide">
                                                <div class="megamenu-tier2">
                                                    <ul class="megamenu-tier2-list" role="menubar">
                                                        <li class="megamenu-tier2-list-item  " role="menuitem">
                                                            <a href="about_us.html#ourpurpose">
                                                                <div class="megamenu-tier2-list-container">
                                                                    <h4 class="megamenu-tier2-list-title aadivas-text-p3">Our Purpose</h4>
                                                                    <p class="megamenu-tier2-list-text aadivas-text-p5"></p>
                                                                </div>
                                                            </a>
                                                            <div class="megamenu-tier2-desc megamenu-hide">
                                                                <div class="megamenu-tier3-wrapper">
                                                                    <div class="megamenu-tier2-desc-without-sublevel">
                                                                        <div class="megamenu-tier2-desc-without-sublevel__desc aadivas-text-p3">Our mission is to bridge the gap between farmer producer organisations and international markets. This way the world gets to benefit from the products of superlative quality and farmers develop economically. We aim to transform the agricultural scenario into a more sustainable one by blending in innovations in our supply chain systems and business models and combining our ancestral farming expertise with the power of emerging technologies. </div>
                                                                        <img class="megamenu-tier2-desc-without-sublevel__img" src="../static/media/farmer.jpg"/>
                                                                        <div class="megamenu-tier2-desc-without-sublevel__btn-title aadivas-text-p5"></div>
                                                                        <div class="megamenu-tier2-desc-without-sublevel__action-container">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <li class="megamenu-tier2-list-item  " role="menuitem">
                                                            <a href="about_us.html#prosperity">
                                                                <div class="megamenu-tier2-list-container">
                                                                    <h4 class="megamenu-tier2-list-title aadivas-text-p3">Our mission goals</h4>
                                                                    <p class="megamenu-tier2-list-text aadivas-text-p5"></p>
                                                                </div>
                                                            </a>
                                                            <div class="megamenu-tier2-desc megamenu-hide">
                                                                <div class="megamenu-tier3-wrapper">
                                                                    <div class="megamenu-tier3 megamenu-tier3-with-3tiers">
                                                                        <ul class="megamenu-tier3-list" role="menubar">
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                               <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#prosperity">Prosperity for all </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">Setting benchmarks for business standards and remuneration systems for all our stakeholders including farmers and their families making agriculture a lucrative industry thus retaining them in the sector.</div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                           <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/god.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#progressive">Progressive communities</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">Supporting and fueling the development of local communities in terms of education and learning opportunities to provide the much needed boost for a thriving economy.</div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/education.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#sustainable">Sustainable growth</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">Contributing towards positive impact on farmer livelihoods, increased community well-being and focus on ecological sustenance. </div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/sgrowth.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <li class="megamenu-tier2-list-item  " role="menuitem">
                                                            <a href="about_us.html#ourvalues">
                                                                
                                                                <div class="megamenu-tier2-list-container">
                                                                    <h4 class="megamenu-tier2-list-title aadivas-text-p3">Our Values</h4>
                                                                    <p class="megamenu-tier2-list-text aadivas-text-p5"></p>
                                                                </div>
                                                            </a>
                                                            
                                                            <div class="megamenu-tier2-desc megamenu-hide">
                                                                <div class="megamenu-tier3-wrapper">
                                                                    <div class="megamenu-tier3 megamenu-tier3-with-3tiers">
                                                                        <ul class="megamenu-tier3-list" role="menubar">
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#ourvalues">Entrepreneurship</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">We are an ambitious group and evangelise entrepreneurship thus attracting new talents and partnerships.</div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/Entrepreneurship.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#ourvalues">Innovation</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">We appreciate, recognise, reward and incorporate innovations brought forward by any stakeholder in the process of farm to table . </div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/innovation.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#ourvalues">Growth </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">We accept that there is no one way to grow a business so we emphasize within our teams on multi-dimensional growth including expanding our service area, forming business partnerships to help our clients grow as well, launching new products in existing markets, diversifying your existing product line. This not only drives business performance but also spurs innovation allowing us to introduce greater sustainability or resilience in the market and lowering costs due to economies of scale.</div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/growth.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#ourvalues">Leadership</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">With multi-industrial expertise and technology we drive our teams and partner relationships to deliver the best value to our customers via our vision and mission. With this vision and mission, our organisation is able to achieve more in just about every aspect of its operation. We are able to unlock our abilities to thrive with change, organisational growth potential and effective resource management. We believe our greatest asset is our people and thus with the right leadership in agriculture & export we are able to invest better in our customers, farmers and employees . </div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/leadership.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#ourvalues">Integrity</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">We deliver what we commit and its reflected in our relationships with our customers suppliers and each other at Aadivas.</div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/integrity.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="about_us.html#ourvalues">Making a difference</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-3tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">We go above and beyond whenever possible to make life easier for our customers, farmers and their communities.</div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/diff.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </li>

                                        <li class="megamenu-tier1-list-item" role="menuitem">
                                        <a class="megamenu-tier1-list-text aadivas-text-p3" href="products.html">Our Products</a>
                                            <div class="megamenu-tier1-desc megamenu-hide">
                                                <div class="megamenu-tier2">
                                                    <ul class="megamenu-tier2-list" role="menubar">
                                                        <li class="megamenu-tier2-list-item ofi megamenu-tier2-list-item-with-image" role="menuitem">
                                                            <a herf="products.html#cerealgrains" class="megamenu-tier2-list-item-with-image-item">
                                                                <img class="megamenu-tier2-list-img" src="../static/media/grains.jpg"/>
                                                                <div class="megamenu-tier2-list-container">
                                                                    <h4 class="megamenu-tier2-list-title aadivas-text-p3">Cereal Grains</h4>
                                                                    <p class="megamenu-tier2-list-text aadivas-text-p5"> Cereal grains are essential to our dietary needs, as well as for animal feeding and for industrial processing. </p>
                                                                </div>
                                                            </a>
                                                            
                                                            <div class="megamenu-tier2-desc megamenu-hide">
                                                                <div class="megamenu-tier3-wrapper">
                                                                    <div class="megamenu-tier3 megamenu-tier3-with-4tiers">
                                                                        <ul class="megamenu-tier3-list" role="menubar">
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#cerealgrains">Wheat</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">Sourced from the best ecological locations of India and with high gluten strength and uniform golden colour makes it ideal for all sorts of bread making and pasta preparation.</div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/wheat.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#cerealgrains">Rice</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">When it comes to the world of rice, India is one of the important global suppliers. The quality of our Basmati and Non-Basmati rice is assured by the unique grain size, aroma and cooking qualities. </div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/rice.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>

                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#cerealgrains">Corn /Maize</a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3">Grown throughout the year in India we emphasize on corn/maize quality which comes loaded with health benefits like high fiber content and essential minerals. Known for its versatility corn/maize can be utilised in almost every need such as food, livestock feed, pharmaceutical, alcoholic beverages etc.</div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/corn.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>

                                                        <li class="megamenu-tier2-list-item oga megamenu-tier2-list-item-with-image" role="menuitem">
                                                            <a herf="products.html#vegetables" class="megamenu-tier2-list-item-with-image-item">
                                                                <img class="megamenu-tier2-list-img" src="../static/media/vegetables.jpg"/>
                                                                <div class="megamenu-tier2-list-container">
                                                                    <h4 class="megamenu-tier2-list-title aadivas-text-p3">Vegetables</h4>
                                                                    <p class="megamenu-tier2-list-text aadivas-text-p5">Handpicked from the farms, our lean packaging systems deliver value which ensures the freshness and flavor of our vegetables are retained till the delivery. </p>
                                                                </div>
                                                            </a>
                                                            
                                                            <div class="megamenu-tier2-desc megamenu-hide">
                                                                <div class="megamenu-tier3-wrapper">
                                                                    <div class="megamenu-tier3 megamenu-tier3-with-4tiers">
                                                                        <ul class="megamenu-tier3-list" role="menubar">
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Green Chilli </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/greenchilli.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Snake Beans </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/beans.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Okra (ladies finger) </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/okra.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Brinjal </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/brinjal.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Potato  </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/potato.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Cucumber  </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/cucumber.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Green Peas </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/greenpeas.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Bottle Gourd </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/bottlegourd.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Cabbage  </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/cabbage.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#vegetables">Cauliflower </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/cauliflower.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>

                                                        <li class="megamenu-tier2-list-item oil megamenu-tier2-list-item-with-image" role="menuitem">
                                                            <a herf="products.html#fruits" class="megamenu-tier2-list-item-with-image-item">
                                                                <img class="megamenu-tier2-list-img" src="../static/media/fruits.jpg"/>
                                                                <div class="megamenu-tier2-list-container">
                                                                    <h4 class="megamenu-tier2-list-title aadivas-text-p3">Fruits </h4>
                                                                    <p class="megamenu-tier2-list-text aadivas-text-p5">All fruits benefit from proper post harvest care.</p>
                                                                </div>
                                                            </a>
                                                            
                                                            <div class="megamenu-tier2-desc megamenu-hide">
                                                                <div class="megamenu-tier3-wrapper">
                                                                    <div class="megamenu-tier3 megamenu-tier3-with-4tiers">
                                                                        <ul class="megamenu-tier3-list" role="menubar">
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#fruits">Litchi </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/litchi.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#fruits">Mangoes </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/mango.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>

                                                        <li class="megamenu-tier2-list-item ofi megamenu-tier2-list-item-with-image" role="menuitem">
                                                            <a href="products.html#nuts" class="megamenu-tier2-list-item-with-image-item">
                                                                <img class="megamenu-tier2-list-img" src="../static/media/n.jpg"/>
                                                                <div class="megamenu-tier2-list-container">
                                                                    <h4 class="megamenu-tier2-list-title aadivas-text-p3">Nuts</h4>
                                                                    <p class="megamenu-tier2-list-text aadivas-text-p5"></p>
                                                                </div>
                                                            </a>
                                                            
                                                            <div class="megamenu-tier2-desc megamenu-hide">
                                                                <div class="megamenu-tier3-wrapper">
                                                                    <div class="megamenu-tier3 megamenu-tier3-with-4tiers">
                                                                        <ul class="megamenu-tier3-list" role="menubar">
                                                                            <li class="megamenu-tier3-list-item" role="menuitem">
                                                                                
                                                                                <div>
                                                                                    <a class="megamenu-tier3-list-text aadivas-text-p3" href="products.html#nuts">Groundnuts </a>
                                                                                </div>
                                                                                <div class="megamenu-tier3-desc megamenu-tier3-desc-with-4tiers megamenu-hide">
                                                                                    <div class="megamenu-tier4">
                                                                                        <div class="megamenu-tier3-desc-text aadivas-text-p3"></div>
                                                                                        <div class="megamenu-tier4-wrapper">
                                                                                            
                                                                                            <div>
                                                                                                <img class="megamenu-tier3-desc-img" src="../static/media/groundnuts.jpg"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </li>

                                        <li class="megamenu-tier1-list-item" role="menuitem">
                                            <a class="megamenu-tier1-list-text aadivas-text-p3" href="contact_us.php">Contact Us</a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                            <div class="megamenu-utilitynav-wrapper"></div>
                            <div class="megamenu-mobile-main">
                                <div class="megamenu-header-mobile aadivas-container">
                                    <div class="megamenu-aadivas-logo-mobile">
                                        <img style="width: 40%;height: 10%;" src="../static/media/logo.png"/>
                                    </div>
                                    <div>
                                        <button class="megamenu-hamberger-btn">
                                            <span class="megamenu-hamberger-icon">&#9776;</span>
                                        </button>
                                        <i class="fa fa-times megamenu-hamberger-menu-close hide" aria-hidden="true"></i>    
                                    </div>
                                </div>
                                <div class="megamenu-desc-mobile hide">
                                    <div class="megamenu-tier1-item-mobile">
                                        <a href="home.html" class="megamenu-tier2-mobile-text aadivas-text-p2">Home</a>
                                    </div>
                                    <div class="megamenu-tier1-item-mobile">
                                        <a href="about_us.html" class="megamenu-tier1-mobile-text aadivas-header-h4">About Us</a>

                                        <i class="fa fa-caret-down megamenu-tier1-caret aadivas-header-h3"></i>
                                        <i class="fa fa-caret-up megamenu-tier1-caret aadivas-header-h3 hide"></i>

                                        <div class="megamenu-tier1-desc-mobile hide">
                                            <div class="megamenu-tier2-item-mobile">
                                                <a href="about_us.html#ourpurpose" class="megamenu-tier2-mobile-text aadivas-text-p2">Our Purpose</a>


                                            </div>
                                            <div class="megamenu-tier2-item-mobile">
                                                <a href="about_us.html#prosperity" class="megamenu-tier2-mobile-text aadivas-text-p2">Our mission goals</a>

                                                <i class="fa fa-caret-down megamenu-tier2-caret aadivas-text-p3"></i>
                                                <i class="fa fa-caret-up megamenu-tier2-caret aadivas-text-p3 hide"></i>

                                                <div class="megamenu-tier2-desc-mobile hide">
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#prosperity" class="megamenu-tier3-mobile-text aadivas-text-p2">Prosperity for all </a>


                                                    </div>

                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#progressive" class="megamenu-tier3-mobile-text aadivas-text-p2">Progressive communities</a>


                                                    </div>

                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#sustainable" class="megamenu-tier3-mobile-text aadivas-text-p2">Sustainable growth</a>


                                                    </div>
                                                </div>
                                            </div>
                                            <div class="megamenu-tier2-item-mobile">
                                                <a href="about_us.html#ourvalues" class="megamenu-tier2-mobile-text aadivas-text-p2">Our Values</a>

                                                <i class="fa fa-caret-down megamenu-tier2-caret aadivas-text-p3"></i>
                                                <i class="fa fa-caret-up megamenu-tier2-caret aadivas-text-p3 hide"></i>

                                                <div class="megamenu-tier2-desc-mobile hide">
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#ourvalues" class="megamenu-tier3-mobile-text aadivas-text-p2">Entrepreneurship</a>

                                                    </div>

                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#ourvalues" class="megamenu-tier3-mobile-text aadivas-text-p2">Innovation</a>


                                                    </div>

                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#ourvalues" class="megamenu-tier3-mobile-text aadivas-text-p2">Growth</a>


                                                    </div>

                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#ourvalues" class="megamenu-tier3-mobile-text aadivas-text-p2">Leadership</a>


                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#ourvalues" class="megamenu-tier3-mobile-text aadivas-text-p2">Integrity </a>


                                                    </div>

                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="about_us.html#ourvalues" class="megamenu-tier3-mobile-text aadivas-text-p2">Making a difference </a>


                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="megamenu-tier1-item-mobile">
                                        <a href="products.html" class="megamenu-tier1-mobile-text aadivas-header-h4">Our Products</a>

                                        <i class="fa fa-caret-down megamenu-tier1-caret aadivas-header-h3"></i>
                                        <i class="fa fa-caret-up megamenu-tier1-caret aadivas-header-h3 hide"></i>

                                        <div class="megamenu-tier1-desc-mobile hide">
                                            <div class="megamenu-tier2-item-mobile">
                                                <a class="megamenu-tier2-mobile-text aadivas-text-p2">Cereal Grains</a>

                                                <i class="fa fa-caret-down megamenu-tier2-caret aadivas-text-p3"></i>
                                                <i class="fa fa-caret-up megamenu-tier2-caret aadivas-text-p3 hide"></i>

                                                <div class="megamenu-tier2-desc-mobile hide">
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#cerealgrains" class="megamenu-tier3-mobile-text aadivas-text-p2">Wheat</a>
                                                    </div>

                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#cerealgrains" class="megamenu-tier3-mobile-text aadivas-text-p2">Rice</a>

                                                    </div>

                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#cerealgrains" class="megamenu-tier3-mobile-text aadivas-text-p2">Corn /Maize </a>

                                                    </div>
                                                </div>
                                            </div>

                                            <div class="megamenu-tier2-item-mobile">
                                                <a class="megamenu-tier2-mobile-text aadivas-text-p2">Vegetables</a>

                                                <i class="fa fa-caret-down megamenu-tier2-caret aadivas-text-p3"></i>
                                                <i class="fa fa-caret-up megamenu-tier2-caret aadivas-text-p3 hide"></i>

                                                <div class="megamenu-tier2-desc-mobile hide">
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Green Chilli </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Snake Beans </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Okra (ladies finger) </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Brinjal </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Potato  </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Cucumber  </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Green Peas </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Bottle Gourd </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Cabbage  </a>
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#vegetables" class="megamenu-tier3-mobile-text aadivas-text-p2">Cauliflower </a>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="megamenu-tier2-item-mobile">
                                                <a class="megamenu-tier2-mobile-text aadivas-text-p2">Fruits</a>

                                                <i class="fa fa-caret-down megamenu-tier2-caret aadivas-text-p3"></i>
                                                <i class="fa fa-caret-up megamenu-tier2-caret aadivas-text-p3 hide"></i>

                                                <div class="megamenu-tier2-desc-mobile hide">
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#fruits" class="megamenu-tier3-mobile-text aadivas-text-p2">Litchi</a>  
                                                    </div>
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#fruits" class="megamenu-tier3-mobile-text aadivas-text-p2">Mangoes</a>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="megamenu-tier2-item-mobile">
                                                <a class="megamenu-tier2-mobile-text aadivas-text-p2">Nuts</a>

                                                <i class="fa fa-caret-down megamenu-tier2-caret aadivas-text-p3"></i>
                                                <i class="fa fa-caret-up megamenu-tier2-caret aadivas-text-p3 hide"></i>

                                                <div class="megamenu-tier2-desc-mobile hide">
                                                    <div class="megamenu-tier3-item-mobile">
                                                        <a href="products.html#nuts" class="megamenu-tier3-mobile-text aadivas-text-p2">Groundnuts </a>  
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="megamenu-tier1-item-mobile">
                                        <a href="contact_us.php" class="megamenu-tier2-mobile-text aadivas-text-p2">Contact Us</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <div class="row">
                  <div class="col-lg-8 col-lg-offset-2">
                    <form id="contact-form" method="post" action="" role="form">
                    <div class="messages"></div>
                    <div class="controls">
                      <div class="row" style="padding-top: 50px;">
                        <div class="col-md-6">
                          <div class="form-group">
                            <label for="form_name">Name *</label>
                            <input id="form_name" type="text" name="name" class="form-control" placeholder="Please enter your name *" required="required" data-error="Name is required.">
                            <div class="help-block with-errors"></div>
                          </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="form_email">Email *</label>
                                <input id="form_email" type="email" name="email" class="form-control" placeholder="Please enter your email *" required="required" data-error="Valid email is required.">
                                <div class="help-block with-errors"></div>
                            </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="form_phone">Phone number *</label>
                                <input id="form_phone" type="tel" name="phone" class="form-control" placeholder="Please enter your phone number *"  required="required" data-error="Phone number is required.">
                                <div class="help-block with-errors"></div>
                            </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-group">
                            <label for="form_country">Select country *</label>
                            <select id="form_country" name="country" class="form-control">
                                <option value="">*---Select country---</option>
                                <option value="Afganistan">Afghanistan</option>
   <option value="Albania">Albania</option>
   <option value="Algeria">Algeria</option>
   <option value="American Samoa">American Samoa</option>
   <option value="Andorra">Andorra</option>
   <option value="Angola">Angola</option>
   <option value="Anguilla">Anguilla</option>
   <option value="Antigua & Barbuda">Antigua & Barbuda</option>
   <option value="Argentina">Argentina</option>
   <option value="Armenia">Armenia</option>
   <option value="Aruba">Aruba</option>
   <option value="Australia">Australia</option>
   <option value="Austria">Austria</option>
   <option value="Azerbaijan">Azerbaijan</option>
   <option value="Bahamas">Bahamas</option>
   <option value="Bahrain">Bahrain</option>
   <option value="Bangladesh">Bangladesh</option>
   <option value="Barbados">Barbados</option>
   <option value="Belarus">Belarus</option>
   <option value="Belgium">Belgium</option>
   <option value="Belize">Belize</option>
   <option value="Benin">Benin</option>
   <option value="Bermuda">Bermuda</option>
   <option value="Bhutan">Bhutan</option>
   <option value="Bolivia">Bolivia</option>
   <option value="Bonaire">Bonaire</option>
   <option value="Bosnia & Herzegovina">Bosnia & Herzegovina</option>
   <option value="Botswana">Botswana</option>
   <option value="Brazil">Brazil</option>
   <option value="British Indian Ocean Ter">British Indian Ocean Ter</option>
   <option value="Brunei">Brunei</option>
   <option value="Bulgaria">Bulgaria</option>
   <option value="Burkina Faso">Burkina Faso</option>
   <option value="Burundi">Burundi</option>
   <option value="Cambodia">Cambodia</option>
   <option value="Cameroon">Cameroon</option>
   <option value="Canada">Canada</option>
   <option value="Canary Islands">Canary Islands</option>
   <option value="Cape Verde">Cape Verde</option>
   <option value="Cayman Islands">Cayman Islands</option>
   <option value="Central African Republic">Central African Republic</option>
   <option value="Chad">Chad</option>
   <option value="Channel Islands">Channel Islands</option>
   <option value="Chile">Chile</option>
   <option value="China">China</option>
   <option value="Christmas Island">Christmas Island</option>
   <option value="Cocos Island">Cocos Island</option>
   <option value="Colombia">Colombia</option>
   <option value="Comoros">Comoros</option>
   <option value="Congo">Congo</option>
   <option value="Cook Islands">Cook Islands</option>
   <option value="Costa Rica">Costa Rica</option>
   <option value="Cote DIvoire">Cote DIvoire</option>
   <option value="Croatia">Croatia</option>
   <option value="Cuba">Cuba</option>
   <option value="Curaco">Curacao</option>
   <option value="Cyprus">Cyprus</option>
   <option value="Czech Republic">Czech Republic</option>
   <option value="Denmark">Denmark</option>
   <option value="Djibouti">Djibouti</option>
   <option value="Dominica">Dominica</option>
   <option value="Dominican Republic">Dominican Republic</option>
   <option value="East Timor">East Timor</option>
   <option value="Ecuador">Ecuador</option>
   <option value="Egypt">Egypt</option>
   <option value="El Salvador">El Salvador</option>
   <option value="Equatorial Guinea">Equatorial Guinea</option>
   <option value="Eritrea">Eritrea</option>
   <option value="Estonia">Estonia</option>
   <option value="Ethiopia">Ethiopia</option>
   <option value="Falkland Islands">Falkland Islands</option>
   <option value="Faroe Islands">Faroe Islands</option>
   <option value="Fiji">Fiji</option>
   <option value="Finland">Finland</option>
   <option value="France">France</option>
   <option value="French Guiana">French Guiana</option>
   <option value="French Polynesia">French Polynesia</option>
   <option value="French Southern Ter">French Southern Ter</option>
   <option value="Gabon">Gabon</option>
   <option value="Gambia">Gambia</option>
   <option value="Georgia">Georgia</option>
   <option value="Germany">Germany</option>
   <option value="Ghana">Ghana</option>
   <option value="Gibraltar">Gibraltar</option>
   <option value="Great Britain">Great Britain</option>
   <option value="Greece">Greece</option>
   <option value="Greenland">Greenland</option>
   <option value="Grenada">Grenada</option>
   <option value="Guadeloupe">Guadeloupe</option>
   <option value="Guam">Guam</option>
   <option value="Guatemala">Guatemala</option>
   <option value="Guinea">Guinea</option>
   <option value="Guyana">Guyana</option>
   <option value="Haiti">Haiti</option>
   <option value="Hawaii">Hawaii</option>
   <option value="Honduras">Honduras</option>
   <option value="Hong Kong">Hong Kong</option>
   <option value="Hungary">Hungary</option>
   <option value="Iceland">Iceland</option>
   <option value="Indonesia">Indonesia</option>
   <option value="India">India</option>
   <option value="Iran">Iran</option>
   <option value="Iraq">Iraq</option>
   <option value="Ireland">Ireland</option>
   <option value="Isle of Man">Isle of Man</option>
   <option value="Israel">Israel</option>
   <option value="Italy">Italy</option>
   <option value="Jamaica">Jamaica</option>
   <option value="Japan">Japan</option>
   <option value="Jordan">Jordan</option>
   <option value="Kazakhstan">Kazakhstan</option>
   <option value="Kenya">Kenya</option>
   <option value="Kiribati">Kiribati</option>
   <option value="Korea North">Korea North</option>
   <option value="Korea Sout">Korea South</option>
   <option value="Kuwait">Kuwait</option>
   <option value="Kyrgyzstan">Kyrgyzstan</option>
   <option value="Laos">Laos</option>
   <option value="Latvia">Latvia</option>
   <option value="Lebanon">Lebanon</option>
   <option value="Lesotho">Lesotho</option>
   <option value="Liberia">Liberia</option>
   <option value="Libya">Libya</option>
   <option value="Liechtenstein">Liechtenstein</option>
   <option value="Lithuania">Lithuania</option>
   <option value="Luxembourg">Luxembourg</option>
   <option value="Macau">Macau</option>
   <option value="Macedonia">Macedonia</option>
   <option value="Madagascar">Madagascar</option>
   <option value="Malaysia">Malaysia</option>
   <option value="Malawi">Malawi</option>
   <option value="Maldives">Maldives</option>
   <option value="Mali">Mali</option>
   <option value="Malta">Malta</option>
   <option value="Marshall Islands">Marshall Islands</option>
   <option value="Martinique">Martinique</option>
   <option value="Mauritania">Mauritania</option>
   <option value="Mauritius">Mauritius</option>
   <option value="Mayotte">Mayotte</option>
   <option value="Mexico">Mexico</option>
   <option value="Midway Islands">Midway Islands</option>
   <option value="Moldova">Moldova</option>
   <option value="Monaco">Monaco</option>
   <option value="Mongolia">Mongolia</option>
   <option value="Montserrat">Montserrat</option>
   <option value="Morocco">Morocco</option>
   <option value="Mozambique">Mozambique</option>
   <option value="Myanmar">Myanmar</option>
   <option value="Nambia">Nambia</option>
   <option value="Nauru">Nauru</option>
   <option value="Nepal">Nepal</option>
   <option value="Netherland Antilles">Netherland Antilles</option>
   <option value="Netherlands">Netherlands (Holland, Europe)</option>
   <option value="Nevis">Nevis</option>
   <option value="New Caledonia">New Caledonia</option>
   <option value="New Zealand">New Zealand</option>
   <option value="Nicaragua">Nicaragua</option>
   <option value="Niger">Niger</option>
   <option value="Nigeria">Nigeria</option>
   <option value="Niue">Niue</option>
   <option value="Norfolk Island">Norfolk Island</option>
   <option value="Norway">Norway</option>
   <option value="Oman">Oman</option>
   <option value="Pakistan">Pakistan</option>
   <option value="Palau Island">Palau Island</option>
   <option value="Palestine">Palestine</option>
   <option value="Panama">Panama</option>
   <option value="Papua New Guinea">Papua New Guinea</option>
   <option value="Paraguay">Paraguay</option>
   <option value="Peru">Peru</option>
   <option value="Phillipines">Philippines</option>
   <option value="Pitcairn Island">Pitcairn Island</option>
   <option value="Poland">Poland</option>
   <option value="Portugal">Portugal</option>
   <option value="Puerto Rico">Puerto Rico</option>
   <option value="Qatar">Qatar</option>
   <option value="Republic of Montenegro">Republic of Montenegro</option>
   <option value="Republic of Serbia">Republic of Serbia</option>
   <option value="Reunion">Reunion</option>
   <option value="Romania">Romania</option>
   <option value="Russia">Russia</option>
   <option value="Rwanda">Rwanda</option>
   <option value="St Barthelemy">St Barthelemy</option>
   <option value="St Eustatius">St Eustatius</option>
   <option value="St Helena">St Helena</option>
   <option value="St Kitts-Nevis">St Kitts-Nevis</option>
   <option value="St Lucia">St Lucia</option>
   <option value="St Maarten">St Maarten</option>
   <option value="St Pierre & Miquelon">St Pierre & Miquelon</option>
   <option value="St Vincent & Grenadines">St Vincent & Grenadines</option>
   <option value="Saipan">Saipan</option>
   <option value="Samoa">Samoa</option>
   <option value="Samoa American">Samoa American</option>
   <option value="San Marino">San Marino</option>
   <option value="Sao Tome & Principe">Sao Tome & Principe</option>
   <option value="Saudi Arabia">Saudi Arabia</option>
   <option value="Senegal">Senegal</option>
   <option value="Seychelles">Seychelles</option>
   <option value="Sierra Leone">Sierra Leone</option>
   <option value="Singapore">Singapore</option>
   <option value="Slovakia">Slovakia</option>
   <option value="Slovenia">Slovenia</option>
   <option value="Solomon Islands">Solomon Islands</option>
   <option value="Somalia">Somalia</option>
   <option value="South Africa">South Africa</option>
   <option value="Spain">Spain</option>
   <option value="Sri Lanka">Sri Lanka</option>
   <option value="Sudan">Sudan</option>
   <option value="Suriname">Suriname</option>
   <option value="Swaziland">Swaziland</option>
   <option value="Sweden">Sweden</option>
   <option value="Switzerland">Switzerland</option>
   <option value="Syria">Syria</option>
   <option value="Tahiti">Tahiti</option>
   <option value="Taiwan">Taiwan</option>
   <option value="Tajikistan">Tajikistan</option>
   <option value="Tanzania">Tanzania</option>
   <option value="Thailand">Thailand</option>
   <option value="Togo">Togo</option>
   <option value="Tokelau">Tokelau</option>
   <option value="Tonga">Tonga</option>
   <option value="Trinidad & Tobago">Trinidad & Tobago</option>
   <option value="Tunisia">Tunisia</option>
   <option value="Turkey">Turkey</option>
   <option value="Turkmenistan">Turkmenistan</option>
   <option value="Turks & Caicos Is">Turks & Caicos Is</option>
   <option value="Tuvalu">Tuvalu</option>
   <option value="Uganda">Uganda</option>
   <option value="United Kingdom">United Kingdom</option>
   <option value="Ukraine">Ukraine</option>
   <option value="United Arab Erimates">United Arab Emirates</option>
   <option value="United States of America">United States of America</option>
   <option value="Uraguay">Uruguay</option>
   <option value="Uzbekistan">Uzbekistan</option>
   <option value="Vanuatu">Vanuatu</option>
   <option value="Vatican City State">Vatican City State</option>
   <option value="Venezuela">Venezuela</option>
   <option value="Vietnam">Vietnam</option>
   <option value="Virgin Islands (Brit)">Virgin Islands (Brit)</option>
   <option value="Virgin Islands (USA)">Virgin Islands (USA)</option>
   <option value="Wake Island">Wake Island</option>
   <option value="Wallis & Futana Is">Wallis & Futana Is</option>
   <option value="Yemen">Yemen</option>
   <option value="Zaire">Zaire</option>
   <option value="Zambia">Zambia</option>
   <option value="Zimbabwe">Zimbabwe</option>
                              </select>
                            <div class="help-block with-errors"></div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <div class="form-group">
                            <label for="form_message">Message *</label>
                            <textarea id="form_message" name="message" class="form-control" placeholder="Leave a message for us *" rows="4" required="required" data-error="Please mention the product of interest, quantity and packaging requirements."></textarea>
                            <div class="help-block with-errors"></div>
                          </div>
                        </div>
                        <div class="col-md-12">
                          <input type="submit" name="reg" class="btn btn-success btn-send" onclick="validateForm();" value="Send message">
                        </div>
                      </div>
                    </div>
                    </form>
                  </div>
            
                </div>
            
              </div>
              <br><br>
              <script>
                function validateForm() {
                    var name =  document.getElementById('form_name').value;
                    if (name == "") {
                        alert("Name cannot be empty");
                        return false;
                    }
                    var email =  document.getElementById('form_email').value;
                    if (email == "") {
                        alert("Email cannot be empty");
                        return false;
                    } else {
                        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if(!re.test(email)){
                            document.querySelector('.status').innerHTML = "Email format invalid";
                            return false;
                        }
                    }
                    var phone =  document.getElementById('form_phone').value;
                    if (phone == "") {
                        alert("Phone number cannot be empty");
                        return false;
                    }
                    var country =  document.getElementById('form_country').value;
                    if (country == "") {
                        alert("Country cannot be empty");
                        return false;
                    }
                    var message =  document.getElementById('form_message').value;
                    if (message == "") {
                        alert("Message cannot be empty");
                        return false;
                    }
                  }
              </script>
            <div class="footer aem-GridColumn aem-GridColumn--default--12">
                <div class="aadivas-container footer-container">
                    <div class="footer-content-info">
                        <div class="aadivas-info-content">
                            <h6 class="footer-title">Aadivas Foods</h6>
                            <div class="info-content">
                                <ul class="list-item">
                                    <li class="list-info">
                                        <a href="home.html" class="aadivas-text-p4 footer-link" target="_self">Home</a>
                                    </li>
                                    <li class="list-info">
                                        <a href="about_us.html" class="aadivas-text-p4 footer-link" target="_self">About Us</a>
                                    </li>

                                    <li class="list-info">
                                        <a href="products.html" class="aadivas-text-p4 footer-link" target="_self">Our Products</a>
                                    </li>

                                    <li class="list-info">
                                        <a href="contact_us.php" class="aadivas-text-p4 footer-link" target="_self">Contact Us</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="copyright aadivas-text-p5">
                        <div>
                            <p class="copyright-content">© 2021 Aadivas Foods All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script type="text/javascript" src="../static/script.js"></script>
</body>
</html>